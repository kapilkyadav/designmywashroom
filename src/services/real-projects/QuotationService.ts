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
   * Calculate internal pricing with margins and GST for each washroom
   * This is for internal team use only and won't be shown to clients
   */
  static calculateInternalPricing(
    washrooms: Washroom[],
    items: any[],
    margins: Record<string, number>,
    gstRate: number
  ): Record<string, any> {
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
        const itemBasePrice = parseFloat(item.amount) || 0;
        let itemMarginAmount = 0;
        
        // Only apply margin if it's a service (not a brand product)
        if (!item.isBrandProduct && item.serviceDetails) {
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
          isBrandProduct: item.isBrandProduct || false
        });
      });
      
      const priceWithMargin = washroomBasePrice + washroomMarginAmount;
      
      // Apply GST only to items that need GST
      const gstableAmount = washroomItems
        .filter(item => item.applyGst !== false)
        .reduce((sum, item) => {
          const itemBasePrice = parseFloat(item.amount) || 0;
          let itemTotalWithMargin = itemBasePrice;
          
          // Only apply margin to non-brand products
          if (!item.isBrandProduct && item.serviceDetails) {
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
    
    // Calculate subtotals and GST
    let subtotalBeforeGst = 0;
    let gstAmount = 0;
    let totalMrp = 0;
    let totalProductCost = 0;
    
    // First pass to calculate totals and organize items by category
    const itemsByCategory: Record<string, any[]> = {};
    
    for (const washroom of washrooms) {
      const washroomItems = (quotationData.items || []).filter((item: any) => 
        item.washroomId === washroom.id || !item.washroomId
      );
      
      washroomItems.forEach((item: any) => {
        // Track product costs separately
        if (item.isBrandProduct) {
          totalProductCost += parseFloat(item.amount) || 0;
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
    }

    // Calculate logistics and creative service charge (7.5% of product cost)
    const logisticsServiceCharge = totalProductCost * 0.075;
    // Add logistics charge to subtotal but don't apply GST to it
    subtotalBeforeGst += logisticsServiceCharge;

    const grandTotal = subtotalBeforeGst + gstAmount;

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
        max-width: 300px;
      }
      
      .company-gst {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
      }
    `;

    // Replace the existing CSS in the style block with these updates
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
            const totalWashroomArea = floorArea + wallArea + ceilingArea;
            
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
                        <th style="width: 40%">Item</th>
                        <th style="width: 25%">Description</th>
                        <th style="width: 17.5%; text-align: right;">MRP</th>
                        <th style="width: 17.5%; text-align: right;">YDS Offer</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${Object.entries(itemsByCategory)
                        .filter(([_, items]) => items.some(item => item.washroomId === washroom.id))
                        .map(([category, items]) => {
                          const washroomItems = items.filter(item => item.washroomId === washroom.id);
                          const categoryTotal = washroomItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
                          const categoryMrp = washroomItems.reduce((sum, item) => sum + (parseFloat(item.mrp) || 0), 0);
                          
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
                              
                              return `
                                <tr>
                                  <td style="padding-left: 24px;">
                                    • ${item.name} ${itemUnit ? `(${itemUnit})` : ''}
                                    ${item.isBrandProduct && discountPercentage > 0 ? 
                                      `<br/><span style="color: #16a34a; font-size: 0.9em;">${discountPercentage}% off</span>` : 
                                      ''}
                                  </td>
                                  <td>${item.description || ''}</td>
                                  <td style="text-align: right;">₹${formatAmount(itemMrp)}</td>
                                  <td style="text-align: right;">₹${formatAmount(itemAmount)}</td>
                                </tr>
                              `;
                            }).join('')}
                            <tr>
                              <td colspan="2" style="text-align: right; font-weight: 500;">Category Total:</td>
                              <td style="text-align: right; font-weight: 500;">₹${formatAmount(categoryMrp)}</td>
                              <td style="text-align: right; font-weight: 500;">₹${formatAmount(categoryTotal)}</td>
                            </tr>
                          `;
                        }).join('')}
                    </tbody>
                  </table>
                  
                  <div class="price-box">
                    <div class="price-row">
                      <span>Total MRP:</span>
                      <span>₹${formatAmount(totalMrp)}</span>
                    </div>
                    <div class="price-row total">
                      <span>YDS Special Price (before GST):</span>
                      <span>₹${formatAmount(subtotalBeforeGst)}</span>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="summary-box">
          <h3 class="section-title">Price Summary</h3>
          <div class="price-row">
            <span>Product Cost:</span>
            <span>₹${formatAmount(totalProductCost)}</span>
          </div>
          <div class="price-row">
            <span>Logistics and Creative Service (7.5%):</span>
            <span>₹${formatAmount(logisticsServiceCharge)}</span>
          </div>
          <div class="price-row">
            <span>Subtotal (before GST):</span>
            <span>₹${formatAmount(subtotalBeforeGst)}</span>
          </div>
          <div class="price-row">
            <span>GST (${quotationData.gstRate || 18}%):</span>
            <span>₹${formatAmount(gstAmount)}</span>
          </div>
          <div class="price-row total">
            <span>Total Amount (with GST):</span>
            <span>₹${formatAmount(grandTotal)}</span>
          </div>
        </div>
        
        <div class="terms-section" style="margin-top: 30px;">
          <h3 class="section-title">Terms & Conditions</h3>
          <div>${quotationData.terms || 'Standard terms and conditions apply.'}</div>
        </div>
        
        <div class="footer">
          <img src="/lovable-uploads/0e4ef5ca-8d0e-4e79-a60b-aceb673a33b7.png" alt="Your Dream Space Logo" />
          <p>This is a computer-generated quotation and doesn't require a signature.</p>
          <p>Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
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
      console.error('Error fetching quotations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quotations",
        variant: "destructive",
      });
      return [];
    }
  }
  
  /**
   * Get a single quotation by ID
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
      toast({
        title: "Error",
        description: "Failed to fetch quotation",
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Delete a quotation by ID
   */
  static async deleteQuotation(quotationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_quotations')
        .delete()
        .eq('id', quotationId);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error deleting quotation:', error);
      toast({
        title: "Error",
        description: "Failed to delete quotation",
        variant: "destructive",
      });
      return false;
    }
  }
}
