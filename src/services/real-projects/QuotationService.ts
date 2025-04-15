import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BaseService } from './BaseService';
import { ProjectQuotation, RealProject, Washroom } from './types';
import { PdfService } from '@/services/PdfService';
import { VendorRateCardService } from '@/services/VendorRateCardService';

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
      const sanitizedQuotationData = {
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
        internalPricingDetails: quotationData.internalPricingDetails || undefined
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
      
      // Calculate base price (sum of all items)
      const basePrice = washroomItems.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0), 
        0
      );
      
      // Apply margin if specified for this washroom
      const marginPercentage = margins[washroom.id] || 0;
      const marginAmount = basePrice * (marginPercentage / 100);
      const priceWithMargin = basePrice + marginAmount;
      
      // Apply GST only to items that need GST
      const gstableAmount = washroomItems
        .filter(item => item.applyGst !== false)
        .reduce((sum, item) => {
          const itemAmount = parseFloat(item.amount) || 0;
          const itemMargin = itemAmount * (marginPercentage / 100);
          return sum + (itemAmount + itemMargin);
        }, 0);
      
      const gstAmount = gstableAmount * (gstRate / 100);
      const totalPrice = priceWithMargin + gstAmount;
      
      // Store pricing details for this washroom
      washroomPricing[washroom.id] = {
        basePrice,
        marginPercentage,
        marginAmount,
        priceWithMargin,
        gstableAmount,
        gstPercentage: gstRate,
        gstAmount,
        totalPrice
      };
      
      // Add to project totals
      projectTotalBasePrice += basePrice;
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
    
    // Calculate total area of all washrooms
    const totalArea = washrooms.reduce((sum, w) => sum + (w.length * w.width), 0);
    
    // Calculate totals and GST
    let subtotalBeforeGst = 0;
    let gstAmount = 0;
    
    // First pass to calculate totals
    washrooms.forEach(washroom => {
      const washroomItems = (quotationData.items || []).filter((item: any) => 
        item.washroomId === washroom.id || !item.washroomId
      );
      
      washroomItems.forEach((item: any) => {
        const itemAmount = parseFloat(item.amount) || 0;
        subtotalBeforeGst += itemAmount;
        
        if (item.applyGst !== false) {
          gstAmount += itemAmount * (quotationData.gstRate || 18) / 100;
        }
      });
    });
    
    const grandTotal = subtotalBeforeGst + gstAmount;
    
    // Group items by category for each washroom
    const washroomItemsByCategory: Record<string, Record<string, any[]>> = {};
    
    for (const washroom of washrooms) {
      const washroomItems = (quotationData.items || []).filter((item: any) => 
        item.washroomId === washroom.id || !item.washroomId
      );
      
      washroomItemsByCategory[washroom.id] = {};
      
      for (const item of washroomItems) {
        if (item.isCategory) {
          // For items that are already categories
          const categoryName = item.name;
          if (!washroomItemsByCategory[washroom.id][categoryName]) {
            washroomItemsByCategory[washroom.id][categoryName] = [];
          }
          
          // If the category has service details, add them individually
          if (item.serviceDetails && item.serviceDetails.length > 0) {
            for (const service of item.serviceDetails) {
              // Get service name from the serviceDetailsMap
              const serviceDetails = quotationData.serviceDetailsMap[service.serviceId] || {};
              const serviceName = serviceDetails.name || service.name || `Service ${service.serviceId}`;
              const serviceUnit = serviceDetails.unit || service.unit || '';
              
              washroomItemsByCategory[washroom.id][categoryName].push({
                name: serviceName,
                unit: serviceUnit,
                description: '',
                amount: service.cost,
                mrp: service.cost * 1.2,
                isService: true
              });
            }
          } else {
            // Add the category itself as an item
            washroomItemsByCategory[washroom.id][categoryName].push(item);
          }
        } else {
          // For regular items
          const categoryName = item.category || 'Other Items';
          if (!washroomItemsByCategory[washroom.id][categoryName]) {
            washroomItemsByCategory[washroom.id][categoryName] = [];
          }
          washroomItemsByCategory[washroom.id][categoryName].push(item);
        }
      }
    }
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quotation ${project.project_id}</title>
        <style>
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
            text-align: center;
            padding: 20px 0;
            margin-bottom: 40px;
            border-bottom: 2px solid var(--border-color);
          }
          
          .header img {
            max-width: 200px;
            margin-bottom: 20px;
          }
          
          .header h1 {
            color: var(--primary-color);
            font-size: 24px;
            margin: 10px 0;
          }
          
          .header h2 {
            color: var(--accent-color);
            font-size: 18px;
            margin: 5px 0;
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
          
          .scope-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          .scope-table th {
            background-color: var(--secondary-color);
            color: var(--primary-color);
            text-align: left;
            padding: 12px;
          }
          
          .scope-table td {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
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
            max-width: 120px;
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
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="/lovable-uploads/0e4ef5ca-8d0e-4e79-a60b-aceb673a33b7.png" alt="Your Dream Space Logo" />
            <h1>Your Dream Space</h1>
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
              <p><strong>Total Area:</strong> ${totalArea.toFixed(2)} sq ft</p>
            </div>
          </div>
          
          <div class="washrooms-section">
            <h3 class="section-title">Washroom Details & Scope of Work</h3>
            ${washrooms.map((washroom, index) => {
              const washroomArea = washroom.length * washroom.width;
              const categoriesForWashroom = washroomItemsByCategory[washroom.id] || {};
              
              return `
                <div class="washroom-card">
                  <div class="washroom-header">
                    <h4 style="margin: 0">${washroom.name}</h4>
                    <span>${washroomArea.toFixed(2)} sq ft</span>
                  </div>
                  <div class="washroom-content">
                    <div>
                      <strong>Dimensions:</strong> ${washroom.length}' × ${washroom.width}' × ${washroom.height}'
                    </div>
                    <div>
                      <strong>Selected Brand:</strong> ${washroom.selected_brand || 'Not specified'}
                    </div>
                    
                    <table class="scope-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Description</th>
                          <th style="text-align: right;">MRP</th>
                          <th style="text-align: right;">Special Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${Object.entries(categoriesForWashroom).map(([category, items]) => {
                          // Calculate category totals
                          const categoryTotal = items.reduce((sum, item) => sum + (item.isService ? item.amount : (parseFloat(item.amount) || 0)), 0);
                          const categoryMrp = categoryTotal * 1.2;
                          
                          return `
                            <tr>
                              <td colspan="4" style="background-color: #f1f5f9; font-weight: 600; padding: 8px 12px;">
                                ${category}
                              </td>
                            </tr>
                            ${items.filter(item => !item.isService || (item.amount && item.amount > 0)).map(item => {
                              const itemAmount = item.isService ? item.amount : (parseFloat(item.amount) || 0);
                              const itemMrp = itemAmount * 1.2;
                              const itemUnit = item.unit || '';
                              
                              return `
                                <tr>
                                  <td style="padding-left: 24px;">
                                    • ${item.name} ${itemUnit ? `(${itemUnit})` : ''}
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
                        <span>₹${formatAmount(subtotalBeforeGst * 1.2)}</span>
                      </div>
                      <div class="price-row">
                        <span>Discount:</span>
                        <span>20%</span>
                      </div>
                      <div class="price-row total">
                        <span>Special Price (before GST):</span>
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
              <span>Subtotal (before GST):</span>
              <span>₹${formatAmount(subtotalBeforeGst)}</span>
            </div>
            <div class="price-row">
              <span>GST (18%):</span>
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
}
