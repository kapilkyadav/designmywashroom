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
        internalPricingDetails: quotationData.internalPricingDetails || undefined,
        serviceDetailsMap: quotationData.serviceDetailsMap || {}
      };
      
      // Calculate internal pricing if enabled
      if (sanitizedQuotationData.internalPricing) {
        // Apply margins to execution services
        sanitizedQuotationData.items = QuotationService.applyMarginsToItems(
          washrooms || [],
          sanitizedQuotationData.items,
          sanitizedQuotationData.margins
        );
        
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
      
      // Only apply margin to execution services
      if (isExecutionService && washroomId && margins[washroomId]) {
        const marginPercentage = margins[washroomId];
        const baseAmount = parseFloat(item.amount) || 0;
        const marginAmount = baseAmount * (marginPercentage / 100);
        
        // Update the amount with margin included
        return {
          ...item,
          baseAmount: baseAmount, // Store original amount for reference
          amount: baseAmount + marginAmount,
          appliedMargin: marginPercentage // Store applied margin for reference
        };
      }
      
      // For items with no washroom ID, check if there's a uniform margin in the margins object
      if (isExecutionService && !washroomId && margins['uniform']) {
        const marginPercentage = margins['uniform'];
        const baseAmount = parseFloat(item.amount) || 0;
        const marginAmount = baseAmount * (marginPercentage / 100);
        
        return {
          ...item,
          baseAmount: baseAmount,
          amount: baseAmount + marginAmount,
          appliedMargin: marginPercentage
        };
      }
      
      // For service details with margin, we need to update each service
      if (isExecutionService && item.serviceDetails && item.serviceDetails.length > 0 && washroomId && margins[washroomId]) {
        const marginPercentage = margins[washroomId];
        // Calculate the total with margin for all services
        let totalWithMargin = 0;
        
        const updatedServiceDetails = item.serviceDetails.map((service: any) => {
          const serviceCost = parseFloat(service.cost) || 0;
          const serviceMarginAmount = serviceCost * (marginPercentage / 100);
          const serviceWithMargin = serviceCost + serviceMarginAmount;
          
          totalWithMargin += serviceWithMargin;
          
          return {
            ...service,
            baseCost: serviceCost,
            cost: serviceWithMargin,
            appliedMargin: marginPercentage
          };
        });
        
        return {
          ...item,
          baseAmount: parseFloat(item.amount) || 0,
          amount: totalWithMargin,
          serviceDetails: updatedServiceDetails,
          appliedMargin: marginPercentage
        };
      }
      
      return item;
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

    const washroomPricing: Record<string, any> = {};
    let projectTotalBasePrice = 0;
    let projectTotalWithMargin = 0;
    let projectTotalGST = 0;
    let projectGrandTotal = 0;
    
    // Process each washroom
    washrooms.forEach(washroom => {
      // Get items for this washroom
      const washroomItems = items.filter(item => 
        item.washroomId === washroom.id || !item.washroomId
      );
      
      let washroomBasePrice = 0;
      let washroomMarginAmount = 0;
      const itemizedPricing: any[] = [];
      
      // Calculate pricing for each item
      washroomItems.forEach(item => {
        if (item.isExecutionService && !item.isBrandProduct && !item.isFixture) {
          const itemBasePrice = parseFloat(item.baseAmount || item.amount) || 0;
          totalExecutionBeforeMargin += itemBasePrice;
          
          const marginPercentage = margins[washroom.id] || 0;
          const itemMarginAmount = itemBasePrice * (marginPercentage / 100);
          totalExecutionWithMargin += (itemBasePrice + itemMarginAmount);
        }
        
        const itemBasePrice = parseFloat(item.amount) || 0;
        let itemMarginAmount = 0;
        
        // Only apply margin if it's an execution service (not a brand product or fixture)
        if (item.isExecutionService && !item.isBrandProduct && !item.isFixture) {
          const marginPercentage = margins[washroom.id] || 0;
          itemMarginAmount = itemBasePrice * (marginPercentage / 100);
        }
        
        const itemTotalPrice = itemBasePrice + itemMarginAmount;
        
        washroomBasePrice += itemBasePrice;
        washroomMarginAmount += itemMarginAmount;
        
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
      
      // Apply GST only to items that need GST
      const gstableAmount = washroomItems
        .filter(item => item.applyGst !== false)
        .reduce((sum, item) => {
          const itemBasePrice = parseFloat(item.amount) || 0;
          let itemTotalWithMargin = itemBasePrice;
          
          // Only apply margin to execution services
          if (item.isExecutionService && !item.isBrandProduct && !item.isFixture) {
            const marginPercentage = margins[washroom.id] || 0;
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
        marginAmount: washroomMarginAmount,
        marginPercentage: washroomBasePrice > 0 ? (washroomMarginAmount / washroomBasePrice) * 100 : 0,
        priceWithMargin,
        gstableAmount,
        gstPercentage: gstRate,
        gstAmount,
        totalPrice,
        itemizedPricing // Add itemized pricing details
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
      marginDifference: totalExecutionWithMargin - totalExecutionBeforeMargin
    });

    // Overall project pricing summary
    return {
      washroomPricing,
      projectSummary: {
        totalBasePrice: projectTotalBasePrice,
        totalWithMargin: projectTotalWithMargin,
        totalGST: projectTotalGST,
        grandTotal: projectGrandTotal,
        averageMargin: projectTotalBasePrice > 0 
          ? ((projectTotalWithMargin - projectTotalBasePrice) / projectTotalBasePrice) * 100 
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
      const seqA = categorySequenceMap[a[0]] ?? Number.MAX_SAFE_INTEGER;
      const seqB = categorySequenceMap[b[0]] ?? Number.MAX_SAFE_INTEGER;
      return seqA - seqB;
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quotation ${project.project_id}</title>
        <style>
          ${existingStyles.replace(/\.header\s*{[^}]+}/s, cssUpdates)}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-left">
              <img src="/lovable-uploads/0e4ef5ca-8d0e-4e79-a60b-aceb673a33b7.png" alt="Your Dream Space Logo" />
            </div>
            <div class="header-right">
              <div class="company-name">Purebath Interiotech Private Limited</div>
              <div class="company-address">3rd Floor, Orchid Centre, Golf Course Road, near IILM Institute, Sector 53, Gurugram, Haryana 122002</div>
              <div class="company-gst">GST No: 06AAPCP1844F1ZC</div>
            </div>
          </div>
          
        <div class="quotation-title">
          <h2>Quotation #${project.project_id}</h2>
        </div>
        
        <div class="info-grid">
          <div class="client-info">
            <h3 class="section-title">Client Information</h3>
            <p><strong>Name:</strong> ${project.client_name}</p>
            <p><strong>Email:</strong> ${project.client_email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${project.client_mobile}</p>
            <p><strong>Location:</strong> ${project.client_location || 'N/A'}</p>
          </div>
          
          <div class="project-info">
            <h3 class="section-title">Project Details</h3>
            <p><strong>Project ID:</strong> ${project.project_id}</p>
            <p><strong>Date:</strong> ${format(new Date(), 'dd/MM/yyyy')}</p>
            <p><strong>Project Type:</strong> ${project.project_type}</p>
            <p><strong>Address:</strong> ${project.project_details?.address || 'N/A'}</p>
            ${project.project_details?.floor_number ? `<p><strong>Floor:</strong> ${project.project_details.floor_number}</p>` : ''}
            <p><strong>Service Lift:</strong> ${project.project_details?.service_lift_available ? 'Available' : 'Not Available'}</p>
          </div>
        </div>
        
        <div class="washrooms-section">
          ${washrooms.map((washroom) => {
            const floorArea = washroom.length * washroom.width;
            const wallArea = washroom.wall_area || 0;
            const ceilingArea = washroom.ceiling_area || 0;
            // Calculate total washroom area as floor area + wall area only
            const totalWashroomArea = floorArea + wallArea;
            
            return `
              <div class="washroom-card">
                <div class="washroom-header">
                  <h4 style="margin: 0">${washroom.name}</h4>
                  <span>Total Area: ${totalWashroomArea.toFixed(2)} sq ft</span>
                </div>
                <div class="washroom-content">
                  <div class="area-details" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
                    <div>
                      <strong>Dimensions:</strong> ${washroom.length}' × ${washroom.width}' × ${washroom.height}'
                    </div>
                    <div>
                      <strong>Floor Area:</strong> ${floorArea.toFixed(2)} sq ft
                    </div>
                    <div>
                      <strong>Wall Area:</strong> ${wallArea.toFixed(2)} sq ft
                    </div>
                    <div>
                      <strong>Ceiling Area:</strong> ${ceilingArea.toFixed(2)} sq ft
                    </div>
                  </div>
                  <div style="margin-bottom: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                    <strong>Selected Brand:</strong> ${washroom.selected_brand || 'Not specified'}
                  </div>
                  
                  <table class="scope-table">
                    <thead>
                      <tr>
                        <th style="width: 25%">Category</th>
                        <th style="width: 40%">Item</th>
                        <th style="width: 17.5%; text-align: right;">MRP</th>
                        <th style="width: 17.5%; text-align: right;">YDS Offer</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${sortedCategories.map(([category, items]) => {
                        const washroomItems = items.filter(item => item.washroomId === washroom.id);
                        const categoryTotal = washroomItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
                        const categoryMrp = washroomItems.reduce((sum, item) => sum + (parseFloat(item.mrp) || 0), 0);
                        
                        if (washroomItems.length === 0) {
                          return ''; // Skip categories with no items for this washroom
                        }
                        
                        return `
                          <tr>
                            <td colspan="4" style="background-color: #f1f5f9; font-weight: 600; padding: 8px 12px;">
                              ${category}
                            </td>
                          </tr>
                          ${washroomItems.map(item => {
                            const itemAmount = parseFloat(item.amount) || 0;
                            const itemMrp = parseFloat(item.mrp) || 0;
                            const itemUnit = item.unit || '';
                            const discountPercentage = item.isBrandProduct && itemMrp > 0 ? 
                              Math.round((1 - (itemAmount / itemMrp)) * 100) : 0;
                            
                            // Handle execution services differently from brand products
                            if (!item.isBrandProduct && item.serviceDetails) {
                              return item.serviceDetails.map((service: any) => {
                                const serviceName = quotationData.serviceDetailsMap[service.serviceId]?.name || service.serviceId;
                                const categoryName = quotationData.serviceDetailsMap[service.serviceId]?.categoryName || '';
                                const unit = quotationData.serviceDetailsMap[service.serviceId]?.unit || '';
                                const serviceCost = parseFloat(service.cost) || 0;
                                // Use baseCost if available (original cost before margin)
                                const displayCost = service.baseCost !== undefined ? service.baseCost : serviceCost;
                                // Use a 20% markup for MRP display if needed
                                const serviceMrp = displayCost * 1.2;
                                
                                return `
                                  <tr>
                                    <td>${categoryName}</td>
                                    <td style="padding-left: 24px;">
