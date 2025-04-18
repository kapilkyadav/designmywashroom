import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BaseService } from './BaseService';
import { RealProject, ProjectQuotation, Washroom } from './types';

export class QuotationService extends BaseService {
  /**
   * Generate and save a quotation for a project
   */
  static async generateQuotation(
    projectId: string, 
    quotationData: Record<string, any>
  ): Promise<{ success: boolean, quotation: ProjectQuotation | null }> {
    try {
      // Get the project details to include in the quotation
      const { data: project, error: projectError } = await supabase
        .from('real_projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // Get washrooms for this project
      const { data: washrooms, error: washroomsError } = await supabase
        .from('project_washrooms')
        .select('*')
        .eq('project_id', projectId);
      
      if (washroomsError) throw washroomsError;
      
      // Ensure quotationData has valid values
      const sanitizedQuotationData: {
        totalAmount: number;
        items: any[];
        margins: Record<string, number>;
        gstRate: number;
        internalPricing: boolean;
        distributeMarginEqually: boolean;
        mrpMarkupPercentage: number;
        internalPricingDetails?: Record<string, any>;
        serviceDetailsMap?: Record<string, any>;
      } = {
        ...quotationData,
        totalAmount: parseFloat(quotationData.totalAmount) || 0,
        items: (quotationData.items || []).map((item: any) => ({
          ...item,
          amount: parseFloat(item.amount) || 0
        })),
        // Add internal pricing data if provided
        margins: quotationData.margins || {},
        gstRate: quotationData.gstRate || 18, // Default 18% GST
        internalPricing: quotationData.internalPricing || false,
        distributeMarginEqually: quotationData.distributeMarginEqually || false,
        mrpMarkupPercentage: quotationData.mrpMarkupPercentage || 20, // Default 20% markup for MRP
        internalPricingDetails: quotationData.internalPricingDetails || undefined,
        serviceDetailsMap: quotationData.serviceDetailsMap || {}
      };
      
      // Calculate internal pricing if enabled
      if (sanitizedQuotationData.internalPricing) {
        // Clean items before applying any new calculations
        const cleanItems = sanitizedQuotationData.items.map(item => {
          // Remove any previously calculated margin data to start fresh
          const { baseAmount, appliedMargin, mrp, ...cleanItem } = item;
          return cleanItem;
        });
        
        // Apply margins based on selected distribution method
        if (sanitizedQuotationData.distributeMarginEqually) {
          // Apply equal margin distribution method
          sanitizedQuotationData.items = QuotationService.applyEquallyDistributedMargins(
            washrooms || [],
            cleanItems,
            sanitizedQuotationData.margins,
            sanitizedQuotationData.mrpMarkupPercentage
          );
        } else {
          // Use the original percentage-based margin calculation
          sanitizedQuotationData.items = QuotationService.applyMarginsToItems(
            washrooms || [],
            cleanItems,
            sanitizedQuotationData.margins
          );
        }
        
        // Calculate internal pricing details after applying margins
        sanitizedQuotationData.internalPricingDetails = QuotationService.calculateInternalPricing(
          washrooms || [],
          sanitizedQuotationData.items,
          sanitizedQuotationData.margins,
          sanitizedQuotationData.gstRate
        );
      }
      
      // Fetch all service details to get names
      const serviceIds = sanitizedQuotationData.items
        .filter((item: any) => item.serviceDetails && item.serviceDetails.length > 0)
        .flatMap((item: any) => item.serviceDetails.map((service: any) => service.serviceId))
        .filter(Boolean);
      
      let serviceDetailsMap: Record<string, any> = {};
      
      if (serviceIds.length > 0) {
        // Fetch service details from vendor_items
        const { data: serviceItems } = await supabase
          .from('vendor_items')
          .select('id, scope_of_work, measuring_unit, category:vendor_categories(id, name)')
          .in('id', serviceIds);
          
        if (serviceItems) {
          serviceDetailsMap = serviceItems.reduce((acc: Record<string, any>, item: any) => {
            acc[item.id] = {
              name: item.scope_of_work,
              unit: item.measuring_unit,
              categoryName: item.category?.name || 'General'
            };
            return acc;
          }, {});
        }
      }
      
      // Add service names to the quotation data for easier access in the HTML generation
      sanitizedQuotationData.serviceDetailsMap = serviceDetailsMap;
      
      // Generate HTML for the quotation with washroom details
      const quotationHtml = await QuotationService.generateQuotationHtml(project, sanitizedQuotationData, washrooms || []);
      
      // Get the current count of quotations for this project to create a unique sequence number
      const { count, error: countError } = await supabase
        .from('project_quotations')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);
        
      if (countError) throw countError;
      
      // Create a quotation number with sequence to make it unique
      const sequenceNumber = (count || 0) + 1;
      const quotationNumber = `QUO-${project.project_id}-${format(new Date(), 'yyyyMMdd')}-${sequenceNumber}`;
      
      // Get the current user's session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      // Save the quotation
      const quotationToSave = {
        project_id: projectId,
        quotation_number: quotationNumber,
        quotation_data: sanitizedQuotationData,
        quotation_html: quotationHtml,
        created_by: userId || null
      };
      
      const { data: savedQuotation, error: quotationError } = await supabase
        .from('project_quotations')
        .insert(quotationToSave)
        .select()
        .single();
      
      if (quotationError) throw quotationError;
      
      // Update the project with the quotation date
      await supabase
        .from('real_projects')
        .update({
          quotation_generated_at: new Date().toISOString(),
          final_quotation_amount: sanitizedQuotationData.totalAmount || project.final_quotation_amount
        })
        .eq('id', projectId);
      
      toast({
        title: "Quotation generated",
        description: `Quotation ${quotationNumber} has been created successfully.`,
      });
      
      return { success: true, quotation: savedQuotation as ProjectQuotation };
    } catch (error: any) {
      console.error('Error generating quotation:', error);
      toast({
        title: "Error generating quotation",
        description: error.message || "Failed to generate quotation",
        variant: "destructive",
      });
      return { success: false, quotation: null };
    }
  }
  
  /**
   * New method to apply equally distributed margins to execution services
   */
  static applyEquallyDistributedMargins(
    washrooms: Washroom[],
    items: any[],
    margins: Record<string, number>,
    mrpMarkupPercentage: number = 20
  ): any[] {
    // First, group execution services by washroom
    const washroomServices: Record<string, any[]> = {};
    
    // Initialize washroom service groups
    washrooms.forEach(washroom => {
      washroomServices[washroom.id] = [];
    });
    
    // Group execution services by washroom ID
    items.forEach(item => {
      const washroomId = item.washroomId;
      const isExecutionService = item.isExecutionService && !item.isBrandProduct && !item.isFixture;
      
      if (isExecutionService && washroomId && washroomServices[washroomId]) {
        // Store the original amount that never changes
        const originalAmount = parseFloat(item.amount) || 0;
        washroomServices[washroomId].push({
          ...item,
          originalAmount,
          baseAmount: originalAmount
        });
      }
    });
    
    // Calculate total margins and distribute them equally
    Object.entries(washroomServices).forEach(([washroomId, services]) => {
      if (services.length === 0 || margins[washroomId] === undefined) return;
      
      // Calculate total base cost for execution services in this washroom
      const totalBaseCost = services.reduce((sum, service) => 
        sum + (parseFloat(service.baseAmount) || 0), 0);
      
      // Calculate total margin amount based on percentage
      const marginPercentage = margins[washroomId];
      const totalMarginAmount = totalBaseCost * (marginPercentage / 100);
      
      // Calculate equal share of margin for each service
      const equalMarginShare = services.length > 0 ? totalMarginAmount / services.length : 0;
      
      console.log(`Washroom ${washroomId}: Total base cost: ${totalBaseCost}, Margin %: ${marginPercentage}%, Total margin: ${totalMarginAmount}, Equal share: ${equalMarginShare}`);
      
      // Apply equal margin to each service
      services.forEach(service => {
        const baseAmount = parseFloat(service.baseAmount) || 0;
        const newAmount = baseAmount + equalMarginShare;
        
        // Calculate MRP as new amount + markup percentage
        const mrp = newAmount * (1 + (mrpMarkupPercentage / 100));
        
        service.amount = newAmount;
        service.appliedMargin = marginPercentage;
        service.equalMarginShare = equalMarginShare;
        service.mrp = mrp;
        
        console.log(`Service ${service.name}: Base: ${baseAmount}, +Margin: ${newAmount}, MRP: ${mrp}`);
        
        // If the service has service details, distribute margin equally among them too
        if (service.serviceDetails && service.serviceDetails.length > 0) {
          const serviceDetailsCount = service.serviceDetails.length;
          const equalServiceDetailMarginShare = serviceDetailsCount > 0 ? 
            equalMarginShare / serviceDetailsCount : 0;
          
          service.serviceDetails = service.serviceDetails.map((detail: any) => {
            const detailBaseCost = parseFloat(detail.cost) || 0;
            const detailNewCost = detailBaseCost + equalServiceDetailMarginShare;
            const detailMrp = detailNewCost * (1 + (mrpMarkupPercentage / 100));
            
            return {
              ...detail,
              originalCost: detailBaseCost,
              baseCost: detailBaseCost,
              cost: detailNewCost,
              equalMarginShare: equalServiceDetailMarginShare,
              mrp: detailMrp
            };
          });
        }
      });
    });
    
    // Process all items including those that aren't execution services
    return items.map(item => {
      const washroomId = item.washroomId;
      const isExecutionService = item.isExecutionService && !item.isBrandProduct && !item.isFixture;
      
      // If this is an execution service we've already processed
      if (isExecutionService && washroomId && washroomServices[washroomId]) {
        // Find the processed item
        const processedItem = washroomServices[washroomId].find(s => 
          s.id === item.id && s.name === item.name);
        
        if (processedItem) {
          return processedItem;
        }
      }
      
      // For all other items (brand products, fixtures, etc.), preserve as is
      // But ensure they have originalAmount and mrp properties
      const originalAmount = parseFloat(item.amount) || 0;
      return {
        ...item,
        originalAmount,
        baseAmount: originalAmount,
        // For products and fixtures, MRP is usually provided
        mrp: item.mrp || originalAmount
      };
    });
  }
  
  /**
   * Apply margins to execution service items
   */
  static applyMarginsToItems(
    washrooms: Washroom[],
    items: any[],
    margins: Record<string, number>
  ): any[] {
    return items.map(item => {
      const washroomId = item.washroomId;
      const isExecutionService = item.isExecutionService && !item.isBrandProduct && !item.isFixture;
      
      // Get the original amount - we need to always work with the base amount
      const originalAmount = parseFloat(item.originalAmount || item.amount) || 0;
      
      // Only apply margin to execution services
      if (isExecutionService && washroomId && margins[washroomId] !== undefined) {
        const marginPercentage = margins[washroomId];
        const marginAmount = originalAmount * (marginPercentage / 100);
        
        // Update the amount with margin included
        return {
          ...item,
          originalAmount: originalAmount, // Store original amount that never changes
          baseAmount: originalAmount, // Store base amount for reference
          amount: originalAmount + marginAmount,
          appliedMargin: marginPercentage // Store applied margin for reference
        };
      }
      
      // For items with no washroom ID, check if there's a uniform margin in the margins object
      if (isExecutionService && !washroomId && margins['uniform']) {
        const marginPercentage = margins['uniform'];
        const marginAmount = originalAmount * (marginPercentage / 100);
        
        return {
          ...item,
          originalAmount: originalAmount,
          baseAmount: originalAmount,
          amount: originalAmount + marginAmount,
          appliedMargin: marginPercentage
        };
      }
      
      // For service details with margin, we need to update each service
      if (isExecutionService && item.serviceDetails && item.serviceDetails.length > 0 && washroomId && margins[washroomId] !== undefined) {
        const marginPercentage = margins[washroomId];
        // Calculate the total with margin for all services
        let totalWithMargin = 0;
        
        const updatedServiceDetails = item.serviceDetails.map((service: any) => {
          // Use original service cost if available
          const originalServiceCost = parseFloat(service.originalCost || service.cost) || 0;
          const serviceMarginAmount = originalServiceCost * (marginPercentage / 100);
          const serviceWithMargin = originalServiceCost + serviceMarginAmount;
          
          totalWithMargin += serviceWithMargin;
          
          return {
            ...service,
            originalCost: originalServiceCost, // Store original that never changes
            baseCost: originalServiceCost,
            cost: serviceWithMargin,
            appliedMargin: marginPercentage
          };
        });
        
        return {
          ...item,
          originalAmount: originalAmount,
          baseAmount: originalAmount,
          amount: totalWithMargin,
          serviceDetails: updatedServiceDetails,
          appliedMargin: marginPercentage
        };
      }
      
      // For all other items, preserve the original amount but still add it for reference
      return {
        ...item,
        originalAmount: originalAmount
      };
    });
  }
  
  /**
   * Calculate internal pricing with margins and GST for each washroom
   * This is for internal team use only and won't be shown to clients
   */
  static calculateInternalPricing(
    washrooms: Washroom[],
    items: any[],
    margins: Record<string, number>,
    gstRate: number
  ): Record<string, any> {
    let totalExecutionBeforeMargin = 0;
    let totalExecutionWithMargin = 0;
    let totalExecutionMarginAmount = 0;

    const washroomPricing: Record<string, any> = {};
    let projectTotalBasePrice = 0;
    let projectTotalWithMargin = 0;
    let projectTotalGST = 0;
    let projectGrandTotal = 0;
    let projectTotalMarginAmount = 0;
    
    // Process each washroom
    washrooms.forEach(washroom => {
      // Get items for this washroom
      const washroomItems = items.filter(item => 
        item.washroomId === washroom.id || !item.washroomId
      );
      
      let washroomBasePrice = 0;
      let washroomMarginAmount = 0;
      let washroomExecutionBasePrice = 0; // Track execution services base price separately
      const itemizedPricing: any[] = [];
      
      // Calculate pricing for each item
      washroomItems.forEach(item => {
        // Always use original/base amount for calculations to prevent compounding margins
        const itemBasePrice = parseFloat(item.baseAmount || item.originalAmount || item.amount) || 0;
        washroomBasePrice += itemBasePrice;
        
        // For execution services, track margin separately
        if (item.isExecutionService && !item.isBrandProduct && !item.isFixture) {
          washroomExecutionBasePrice += itemBasePrice; // Add to washroom execution base price
          totalExecutionBeforeMargin += itemBasePrice;
          
          // Calculate margin amount based on margin percentage for this washroom
          const marginPercentage = margins[washroom.id] !== undefined ? margins[washroom.id] : 0;
          const itemMarginAmount = itemBasePrice * (marginPercentage / 100);
          
          washroomMarginAmount += itemMarginAmount;
          totalExecutionMarginAmount += itemMarginAmount;
          totalExecutionWithMargin += (itemBasePrice + itemMarginAmount);
        }
        
        // Calculate item-specific pricing details for the itemized breakdown
        let itemMarginAmount = 0;
        
        // Only apply margin if it's an execution service (not a brand product or fixture)
        if (item.isExecutionService && !item.isBrandProduct && !item.isFixture) {
          const marginPercentage = margins[washroom.id] !== undefined ? margins[washroom.id] : 0;
          itemMarginAmount = itemBasePrice * (marginPercentage / 100);
        }
        
        const itemTotalPrice = itemBasePrice + itemMarginAmount;
        
        itemizedPricing.push({
          itemName: item.name,
          basePrice: itemBasePrice,
          marginAmount: itemMarginAmount,
          totalPrice: itemTotalPrice,
          isBrandProduct: item.isBrandProduct || false,
          isFixture: item.isFixture || false,
          isExecutionService: item.isExecutionService || false
        });
      });
      
      const priceWithMargin = washroomBasePrice + washroomMarginAmount;
      projectTotalMarginAmount += washroomMarginAmount;
      
      // Apply GST only to items that need GST
      const gstableAmount = washroomItems
        .filter(item => item.applyGst !== false)
        .reduce((sum, item) => {
          // Always use base price for GST calculation to prevent compounding
          const itemBasePrice = parseFloat(item.baseAmount || item.originalAmount || item.amount) || 0;
          let itemTotalWithMargin = itemBasePrice;
          
          // Only apply margin to execution services
          if (item.isExecutionService && !item.isBrandProduct && !item.isFixture) {
            const marginPercentage = margins[washroom.id] !== undefined ? margins[washroom.id] : 0;
            const itemMarginAmount = itemBasePrice * (marginPercentage / 100);
            itemTotalWithMargin += itemMarginAmount;
          }
          
          return sum + itemTotalWithMargin;
        }, 0);
      
      const gstAmount = gstableAmount * (gstRate / 100);
      const totalPrice = priceWithMargin + gstAmount;
      
      // Store pricing details for this washroom
      washroomPricing[washroom.id] = {
        basePrice: washroomBasePrice,
        executionBasePrice: washroomExecutionBasePrice,
        marginAmount: washroomMarginAmount,
        marginPercentage: margins[washroom.id] !== undefined ? margins[washroom.id] : 0,
        priceWithMargin,
        gstableAmount,
        gstPercentage: gstRate,
        gstAmount,
        totalPrice,
        itemizedPricing
      };
      
      // Add to project totals
      projectTotalBasePrice += washroomBasePrice;
      projectTotalWithMargin += priceWithMargin;
      projectTotalGST += gstAmount;
      projectGrandTotal += totalPrice;
    });

    console.log('Execution Services Analysis:', {
      beforeMargin: totalExecutionBeforeMargin,
      afterMargin: totalExecutionWithMargin,
      marginDifference: totalExecutionWithMargin - totalExecutionBeforeMargin,
      marginAmount: totalExecutionMarginAmount,
      appliedMargins: margins
    });

    // Overall project pricing summary
    return {
      washroomPricing,
      projectSummary: {
        totalBasePrice: projectTotalBasePrice,
        executionServicesBasePrice: totalExecutionBeforeMargin,
        totalWithMargin: projectTotalWithMargin,
        totalGST: projectTotalGST,
        grandTotal: projectGrandTotal,
        marginAmount: projectTotalMarginAmount,
        actualMarginPercentage: totalExecutionBeforeMargin > 0 
          ? (totalExecutionMarginAmount / totalExecutionBeforeMargin) * 100 
          : 0
      }
    };
  }
  
  /**
   * Helper function to generate HTML for quotation
   */
  static async generateQuotationHtml(project: RealProject, quotationData: Record<string, any>, washrooms: Washroom[]): Promise<string> {
    const formatAmount = (value: any): string => {
      if (value === undefined || value === null) return '0';
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(numValue) ? '0' : numValue.toLocaleString('en-IN');
    };
    
    // Calculate subtotals, product cost, and other values outside of washroom loops
    // This ensures all items are included regardless of washroom association
    let subtotalBeforeGst = 0;
    let gstAmount = 0;
    let totalMrp = 0;
    
    // Initialize separate cost categories
    let totalExecutionServicesCost = 0;
    let totalProductCost = 0;
    let totalFixturesCost = 0;
    
    // First pass to calculate totals and organize items by category
    const itemsByCategory: Record<string, any[]> = {};
    
    // Process all items together first to calculate global totals
    (quotationData.items || []).forEach((item: any) => {
      // Track different types of costs separately
      if (item.isBrandProduct) {
        totalProductCost += parseFloat(item.amount) || 0;
      } else if (item.isFixture) {
        totalFixturesCost += parseFloat(item.amount) || 0;
      } else {
        // Execution services (everything else)
        totalExecutionServicesCost += parseFloat(item.amount) || 0;
      }
      
      // Add to category grouping
      const category = item.serviceDetails?.[0]?.categoryName || 'General';
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);
      
      subtotalBeforeGst += parseFloat(item.amount) || 0;
      totalMrp += parseFloat(item.mrp) || 0;

      // Only apply GST to items marked as applying GST (execution services)
      if (item.applyGst !== false) {
        const amountForGst = parseFloat(item.amount) || 0;
        gstAmount += amountForGst * (quotationData.gstRate || 18) / 100;
      }
    });

    // Calculate logistics and creative service charge (7.5% of product cost)
    const logisticsServiceCharge = totalProductCost * 0.075;
    // Add logistics charge to subtotal but don't apply GST to it
    subtotalBeforeGst += logisticsServiceCharge;

    const grandTotal = subtotalBeforeGst + gstAmount;

    // Store all cost details in a structured format for easier access
    const costBreakdown = {
      executionServices: {
        title: "Execution Services",
        amount: totalExecutionServicesCost,
        applyGst: true
      },
      brandProducts: {
        title: "Selected Brand Products",
        amount: totalProductCost,
        applyGst: false
      },
      fixtures: {
        title: "Fixtures",
        amount: totalFixturesCost,
        applyGst: true
      },
      logistics: {
        title: "Logistics and Creative Service (7.5%)",
        amount: logisticsServiceCharge,
        applyGst: false
      }
    };

    const existingStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        :root {
          --primary-color: #1A1F2C;
          --secondary-color: #E5DEFF;
          --accent-color: #6E59A5;
          --border-color: #e2e8f0;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          color: #1A1F2C;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          margin-bottom: 40px;
          border-bottom: 2px solid var(--border-color);
        }
        
        .header-left {
          display: flex;
          align-items: center;
        }
        
        .header-left img {
          max-width: 120px;
          margin-right: 20px;
        }
        
        .header-right {
          text-align: right;
        }
        
        .company-name {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 5px;
          color: var(--primary-color);
        }
        
        .company-address {
          font-size: 12px;
          margin-bottom: 5px;
          color: #64748b;
          max-width: 300px;
        }
        
        .company-gst {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }
        
        .quotation-title {
          text-align: center;
          margin-top: 20px;
          color: var(--accent-color);
          font-size: 18px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
          margin-bottom: 30px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
        }
        
        .section-title {
          color: var(--primary-color);
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--border-color);
        }
        
        .washroom-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .washroom-header {
          background: var(--primary-color);
          color: white;
          padding: 15px 20px;
          border-radius: 8px 8px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .washroom-content {
          padding: 20px;
        }
        
        .area-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .scope-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          table-layout: fixed;
        }
        
        .scope-table th {
          background-color: var(--secondary-color);
          color: var(--primary-color);
          text-align: left;
          padding: 12px;
          font-weight: 600;
          border: 1px solid #ddd;
        }
        
        .scope-table td {
          padding: 12px;
          border: 1px solid #ddd;
          word-wrap: break-word;
        }
        
        .price-box {
          background: var(--secondary-color);
          padding: 15px;
          border-radius: 6px;
          margin-top: 20px;
        }
        
        .price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .price-row.total {
          font-weight: 600;
          border-top: 1px solid var(--border-color);
          padding-top: 8px;
        }
        
        .footer {
          text-align: center;
          padding-top: 30px;
          border-top: 2px solid var(--border-color);
          color: #64748b;
          font-size: 14px;
        }
        
        .footer img {
          max-width: 100px;
          margin-bottom: 15px;
        }
        
        .summary-box {
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 20px;
          margin-top: 30px;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .container {
            max-width: 100%;
            padding: 20px;
          }
          
          .washroom-header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
            background-color: var(--primary-color) !important;
            color: white !important;
          }
          
          .scope-table th {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background-color: var(--secondary-color) !important;
          }
        }
      `;

    // Update the CSS for the header section
    const cssUpdates = `
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
        margin-bottom: 40px;
        border-bottom: 2px solid var(--border-color);
      }
      
      .header-left {
        display: flex;
        align-items: center;
      }
      
      .header-left img {
        max-width: 120px;
        margin-right: 20px;
      }
      
      .header-right {
        text-align: right;
      }
      
      .company-name {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 5px;
        color: var(--primary-color);
      }
      
      .company-address {
        font-size: 12px;
        margin-bottom: 5px;
        color: #64748b;
        max-width: 349px;
      }
      
      .company-gst {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
      }
      
      /* Cost breakdown styles */
      .cost-category {
        margin-bottom: 8px;
      }
      
      .cost-category-title {
        font-weight: 500;
      }
      
      .cost-category-amount {
        text-align: right;
      }
    `;

    // Replace the existing CSS in the style block with these updates
    // Get categories with their sequence numbers from vendor_categories
    const { data: categories } = await supabase
      .from('vendor_categories')
      .select('*')
      .order('sequence');
      
    // Create a map of category IDs to their sequence numbers
    const categorySequenceMap: Record<string, number> = {};
    if (categories) {
      categories.forEach((category, index) => {
        categorySequenceMap[category.name] = category.sequence || index;
      });
    }

    // Sort categories by their sequence
    const sortedCategories = Object.entries(itemsByCategory).sort((a, b) => {
      const seqA = categorySequenceMap[a
