import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BaseService } from './BaseService';
import { RealProject, ProjectQuotation, Washroom } from './types';

// Define types for better type safety
interface QuotationData {
  totalAmount: string;
  items: any[];
  margins: Record<string, number>;
  gstRate: number;
  internalPricing: boolean;
  internalPricingDetails?: Record<string, any>;
  serviceDetailsMap?: Record<string, any>;
  terms?: string;
}

interface PricingResult {

  static validateQuotationData(quotationData: QuotationData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!quotationData.items || quotationData.items.length === 0) {
      errors.push('No items found in quotation');
    }

    if (quotationData.gstRate < 0 || quotationData.gstRate > 100) {
      errors.push('Invalid GST rate');
    }

    quotationData.items?.forEach((item, index) => {
      if (item.amount < 0) {
        errors.push(`Invalid amount for item at index ${index}`);
      }
      if (item.mrp < 0) {
        errors.push(`Invalid MRP for item at index ${index}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  beforeMargin: number;
  afterMargin: number;
  marginDifference: number;
  marginAmount: number;
  appliedMargins: Record<string, number>;
}

export class QuotationService extends BaseService {
  /**
   * Generate and save a quotation for a project
   */
  static async generateQuotation(
    projectId: string,
    quotationData: QuotationData
  ): Promise<{ success: boolean; quotation: ProjectQuotation | null }> {
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
      const sanitizedQuotationData: QuotationData = {
        ...quotationData,
        totalAmount: parseFloat(quotationData.totalAmount) || 0,
        items: (quotationData.items || []).map((item: any) => ({
          ...item,
          amount: parseFloat(item.amount) || 0,
          originalAmount: parseFloat(item.originalAmount || item.amount) || 0, // Ensure originalAmount is present
          mrp: parseFloat(item.mrp) || 0, // Ensure mrp is present
          baseAmount: parseFloat(item.baseAmount || item.amount) || 0, // Ensure baseAmount is present
          cost: parseFloat(item.cost || item.amount) || 0 // Ensure cost is present
        })),
        margins: quotationData.margins || {},
        gstRate: quotationData.gstRate || 18, // Default 18% GST
        internalPricing: quotationData.internalPricing || false,
        internalPricingDetails: quotationData.internalPricingDetails || undefined,
        serviceDetailsMap: quotationData.serviceDetailsMap || {},
        terms: quotationData.terms || undefined
      };

      // Calculate internal pricing if enabled
      if (sanitizedQuotationData.internalPricing) {
        // Apply margins to execution services - IMPORTANT: make sure we use original item amounts
        const cleanItems = sanitizedQuotationData.items.map((item) => ({
          ...item,
          appliedMargin: undefined,
          baseAmount: item.originalAmount, // Reset baseAmount to originalAmount
          amount: item.originalAmount // Reset amount to originalAmount
        }));

        sanitizedQuotationData.items = QuotationService.applyMarginsToItems(
          washrooms || [],
          cleanItems,
          sanitizedQuotationData.margins
        );

        //Added try catch block for error handling
        try {
          sanitizedQuotationData.internalPricingDetails = QuotationService.calculateInternalPricing(
            washrooms || [],
            sanitizedQuotationData.items,
            sanitizedQuotationData.margins,
            sanitizedQuotationData.gstRate
          );
        } catch (error: any) {
          console.error('Error calculating internal pricing', error);
          throw new Error('Failed to calculate internal pricing');
        }
      }

      // Fetch all service details to get names
      const serviceIds = sanitizedQuotationData.items
        .filter((item: any) => item.serviceDetails && item.serviceDetails.length > 0)
        .flatMap((item: any) => item.serviceDetails.map((service: any) => service.serviceId))
        .filter(Boolean);

      let serviceDetailsMap: Record<string, any> = {};

      if (serviceIds.length > 0) {
        // Fetch service details from vendor_items
        const { data: serviceItems, error: serviceItemsError } = await supabase
          .from('vendor_items')
          .select('id, scope_of_work, measuring_unit, category:vendor_categories(id, name)')
          .in('id', serviceIds);

        if (serviceItemsError) throw serviceItemsError;
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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
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
    return items.map((item) => {
      const washroomId = item.washroomId;
      const isExecutionService = item.isExecutionService && !item.isBrandProduct && !item.isFixture;
      const originalAmount = item.originalAmount || 0;

      if (isExecutionService && washroomId && margins[washroomId] !== undefined) {
        const marginPercentage = margins[washroomId];
        const marginAmount = originalAmount * (marginPercentage / 100);
        return {
          ...item,
          originalAmount,
          baseAmount: originalAmount,
          amount: originalAmount + marginAmount,
          appliedMargin: marginPercentage
        };
      }

      if (isExecutionService && !washroomId && margins['uniform']) {
        const marginPercentage = margins['uniform'];
        const marginAmount = originalAmount * (marginPercentage / 100);
        return {
          ...item,
          originalAmount,
          baseAmount: originalAmount,
          amount: originalAmount + marginAmount,
          appliedMargin: marginPercentage
        };
      }

      if (isExecutionService && item.serviceDetails && item.serviceDetails.length > 0 && washroomId && margins[washroomId] !== undefined) {
        const marginPercentage = margins[washroomId];
        let totalWithMargin = 0;
        const updatedServiceDetails = item.serviceDetails.map((service: any) => {
          const originalServiceCost = service.originalCost || service.cost || 0;
          const serviceMarginAmount = originalServiceCost * (marginPercentage / 100);
          const serviceWithMargin = originalServiceCost + serviceMarginAmount;
          totalWithMargin += serviceWithMargin;
          return {
            ...service,
            originalCost: originalServiceCost,
            baseCost: originalServiceCost,
            cost: serviceWithMargin,
            appliedMargin: marginPercentage
          };
        });
        return {
          ...item,
          originalAmount,
          baseAmount: originalAmount,
          amount: totalWithMargin,
          serviceDetails: updatedServiceDetails,
          appliedMargin: marginPercentage
        };
      }

      return {
        ...item,
        originalAmount
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
  ): PricingResult {
    if (!washrooms || !items || !margins || !gstRate) {
      throw new Error('Invalid input parameters provided');
    }

    let totalExecutionBeforeMargin = 0;
    let totalExecutionWithMargin = 0;
    let totalExecutionMarginAmount = 0;

    const washroomPricing: Record<string, any> = {};
    let projectTotalBasePrice = 0;
    let projectTotalWithMargin = 0;
    let projectTotalGST = 0;
    let projectGrandTotal = 0;
    let projectTotalMarginAmount = 0;

    washrooms.forEach((washroom) => {
      const washroomItems = items.filter((item) => item.washroomId === washroom.id || !item.washroomId);
      let washroomBasePrice = 0;
      let washroomMarginAmount = 0;
      let washroomExecutionBasePrice = 0;
      const itemizedPricing: any[] = [];

      washroomItems.forEach((item) => {
        const itemBasePrice = item.baseAmount || item.originalAmount || item.amount || 0;
        washroomBasePrice += itemBasePrice;
        if (item.isExecutionService && !item.isBrandProduct && !item.isFixture) {
          washroomExecutionBasePrice += itemBasePrice;
          totalExecutionBeforeMargin += itemBasePrice;
          const marginPercentage = margins[washroom.id] !== undefined ? margins[washroom.id] : 0;
          const itemMarginAmount = itemBasePrice * (marginPercentage / 100);
          washroomMarginAmount += itemMarginAmount;
          totalExecutionMarginAmount += itemMarginAmount;
          totalExecutionWithMargin += itemBasePrice + itemMarginAmount;
        }
        let itemMarginAmount = 0;
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

      const gstableAmount = washroomItems
        .filter((item) => item.applyGst !== false)
        .reduce((sum, item) => {
          const itemBasePrice = item.baseAmount || item.originalAmount || item.amount || 0;
          let itemTotalWithMargin = itemBasePrice;
          if (item.isExecutionService && !item.isBrandProduct && !item.isFixture) {
            const marginPercentage = margins[washroom.id] !== undefined ? margins[washroom.id] : 0;
            const itemMarginAmount = itemBasePrice * (marginPercentage / 100);
            itemTotalWithMargin += itemMarginAmount;
          }
          return sum + itemTotalWithMargin;
        }, 0);

      const gstAmount = gstableAmount * (gstRate / 100);
      const totalPrice = priceWithMargin + gstAmount;

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

      projectTotalBasePrice += washroomBasePrice;
      projectTotalWithMargin += priceWithMargin;
      projectTotalGST += gstAmount;
      projectGrandTotal += totalPrice;
    });

    return {
      beforeMargin: totalExecutionBeforeMargin,
      afterMargin: totalExecutionWithMargin,
      marginDifference: totalExecutionWithMargin - totalExecutionBeforeMargin,
      marginAmount: totalExecutionMarginAmount,
      appliedMargins: margins
    };
  }

  /**
   * Helper function to generate HTML for quotation
   */
  static async generateQuotationHtml(project: RealProject, quotationData: QuotationData, washrooms: Washroom[]): Promise<string> {
    const formatAmount = (value: any): string => {
      if (value === undefined || value === null) return '0';
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(numValue) ? '0' : numValue.toLocaleString('en-IN');
    };

    let subtotalBeforeGst = 0;
    let gstAmount = 0;
    let totalMrp = 0;

    let totalExecutionServicesCost = 0;
    let totalProductCost = 0;
    let totalFixturesCost = 0;

    const itemsByCategory: Record<string, any[]> = {};

    (quotationData.items || []).forEach((item: any) => {
      if (item.isBrandProduct) {
        totalProductCost += parseFloat(item.amount) || 0;
      } else if (item.isFixture) {
        totalFixturesCost += parseFloat(item.amount) || 0;
      } else {
        totalExecutionServicesCost += parseFloat(item.amount) || 0;
      }

      const category = item.serviceDetails?.[0]?.categoryName || 'General';
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);

      subtotalBeforeGst += parseFloat(item.amount) || 0;
      totalMrp += parseFloat(item.mrp) || 0;

      if (item.applyGst !== false) {
        const amountForGst = parseFloat(item.amount) || 0;
        gstAmount += amountForGst * (quotationData.gstRate || 18) / 100;
      }
    });

    const logisticsServiceCharge = totalProductCost * 0.075;
    subtotalBeforeGst += logisticsServiceCharge;

    const grandTotal = subtotalBeforeGst + gstAmount;

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

    const { data: categories, error: categoriesError } = await supabase
      .from('vendor_categories')
      .select('*')
      .order('sequence');

    if (categoriesError) throw categoriesError;


    const categorySequenceMap: Record<string, number> = {};
    if (categories) {
      categories.forEach((category, index) => {
        categorySequenceMap[category.name] = category.sequence || index;
      });
    }

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
                        const washroomItems = items.filter((item) => item.washroomId === washroom.id);
                        const categoryTotal = washroomItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
                        const categoryMrp = washroomItems.reduce((sum, item) => sum + (parseFloat(item.mrp) || 0), 0);

                        if (washroomItems.length === 0) {
                          return '';
                        }

                        return `
                          <tr>
                            <td colspan="4" style="background-color: #f1f5f9; font-weight: 600; padding: 8px 12px;">
                              ${category}
                            </td>
                          </tr>
                          ${washroomItems.map((item) => {
                            const itemAmount = parseFloat(item.amount) || 0;
                            const itemMrp = parseFloat(item.mrp) || 0;
                            const itemUnit = item.unit || '';
                            const discountPercentage = item.isBrandProduct && itemMrp > 0 ?
                              Math.round((1 - (itemAmount / itemMrp)) * 100) : 0;

                            if (!item.isBrandProduct && item.serviceDetails) {
                              return item.serviceDetails.map((service: any) => {
                                const serviceName = quotationData.serviceDetailsMap?.[service.serviceId]?.name || service.name || 'Service';
                                const serviceUnit = quotationData.serviceDetailsMap?.[service.serviceId]?.unit || '';
                                const serviceCost = parseFloat(service.cost) || 0;

                                return `
                                  <tr>
                                    <td>${category}</td>
                                    <td>${serviceName} ${serviceUnit ? `(${serviceUnit})` : ''}</td>
                                    <td style="text-align: right;">-</td>
                                    <td style="text-align: right;">₹${formatAmount(serviceCost)}</td>
                                  </tr>
                                `;
                              }).join('');
                            }

                            return `
                              <tr>
                                <td>${item.categoryName || category}</td>
                                <td>${item.name} ${itemUnit ? `(${itemUnit})` : ''}</td>
                                <td style="text-align: right;">₹${formatAmount(itemMrp)}</td>
                                <td style="text-align: right;">₹${formatAmount(itemAmount)}</td>
                              </tr>
                            `;
                          }).join('')}
                          <tr>
                            <td colspan="2" style="text-align: right; font-weight: 500;">Category Subtotal:</td>
                            <td style="text-align: right; font-weight: 500;">₹${formatAmount(categoryMrp)}</td>
                            <td style="text-align: right; font-weight: 500;">₹${formatAmount(categoryTotal)}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="summary-box">
          <h3 class="section-title">Quotation Summary</h3>

          <div class="cost-breakdown">
            ${Object.entries(costBreakdown).map(([key, details]: [string, any]) => `
              <div class="cost-category">
                <div class="price-row">
                  <div class="cost-category-title">${details.title}:</div>
                  <div class="cost-category-amount">₹${formatAmount(details.amount)}</div>
                </div>
              </div>
            `).join('')}

            <div class="price-row" style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px;">
              <div style="font-weight: 500;">Subtotal:</div>
              <div style="font-weight: 500;">₹${formatAmount(subtotalBeforeGst)}</div>
            </div>

            <div class="price-row">
              <div>GST (${quotationData.gstRate || 18}%):</div>
              <div>₹${formatAmount(gstAmount)}</div>
            </div>

            <div class="price-row total" style="border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 8px;">
              <div>Grand Total:</div>
              <div>₹${formatAmount(grandTotal)}</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <h3 class="section-title">Terms & Conditions</h3>
          <div>
            ${quotationData.terms || `
              <ol>
                <li>50% advance payment is required at the time of order confirmation.</li>
                <li>Balance payment is due on completion of the project.</li>
                <li>Prices are inclusive of installation and applicable taxes.</li>
                <li>Delivery timeline will be 4-6 weeks from the date of order confirmation and advance payment.</li>
                <li>This quotation is valid for 15 days from the date of issue.</li>
              </ol>
            `}
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing Your Dream Space!</p>
          <p>For any queries, please contact us at <strong>info@yourdreamspace.com</strong> or call <strong>+91 9876543210</strong></p>
        </div>
      </div>
    </body>
    </html>
    `;

    return htmlTemplate;
  }

  /**
   * Get all quotations for a project
   */
  static async getProjectQuotations(projectId: string): Promise<ProjectQuotation[]> {
    try {
      const { data, error } = await supabase
        .from('project_quotations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as ProjectQuotation[];
    } catch (error: any) {
      console.error('Error fetching project quotations:', error);
      return [];
    }
  }

  /**
   * Get a specific quotation
   */
  static async getQuotation(quotationId: string): Promise<ProjectQuotation | null> {
    try {
      const { data, error } = await supabase
        .from('project_quotations')
        .select('*')
        .eq('id', quotationId)
        .single();

      if (error) throw error;

      return data as ProjectQuotation;
    } catch (error: any) {
      console.error('Error fetching quotation:', error);
      return null;
    }
  }

  /**
   * Delete a quotation
   */
  static async deleteQuotation(quotationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_quotations')
        .delete()
        .eq('id', quotationId);

      if (error) throw error;

      toast({
        title: "Quotation deleted",
        description: "The quotation has been deleted successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting quotation:', error);
      toast({
        title: "Error deleting quotation",
        description: error.message || "Failed to delete quotation",
        variant: "destructive",
      });
      return false;
    }
  }
}