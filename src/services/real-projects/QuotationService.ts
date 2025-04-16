import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BaseService } from './BaseService';
import { ProjectQuotation, RealProject, Washroom } from './types';
import { PdfService } from '@/services/PdfService';

export class QuotationService extends BaseService {
  /**
   * Generate and save a quotation for a project
   */
  static async generateQuotation(
    projectId: string, 
    quotationData: Record<string, any>
  ): Promise<{ success: boolean, quotation: ProjectQuotation | null }> {
    try {
      // Get the project details and washrooms
      const { data: project, error: projectError } = await supabase
        .from('real_projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      const { data: washrooms, error: washroomsError } = await supabase
        .from('project_washrooms')
        .select('*')
        .eq('project_id', projectId);
      
      if (washroomsError) throw washroomsError;

      // Extract ALL service IDs from service_details of washrooms
      const allServiceIds = washrooms
        .flatMap(washroom => {
          const serviceDetails = washroom.service_details || {};
          // Safely extract service IDs by ensuring we're working with arrays
          return Object.values(serviceDetails)
            .flatMap((category: any) => {
              // Check if category is an array before trying to map over it
              if (Array.isArray(category)) {
                return category.map((service: any) => service.serviceId);
              } else {
                // If it's not an array, return an empty array (or extract the ID if it's an object)
                console.log('Non-array category found:', category);
                return [];
              }
            })
            .filter(Boolean);
        });
      
      console.log('Service IDs from washrooms:', allServiceIds);

      // Fetch service details with categories in a single query
      const { data: serviceDetails, error: serviceError } = await supabase
        .from('vendor_items')
        .select(`
          id,
          scope_of_work,
          measuring_unit,
          category:vendor_categories!vendor_items_category_id_fkey (
            id,
            name
          )
        `)
        .in('id', allServiceIds);

      if (serviceError) {
        console.error('Error fetching service details:', serviceError);
        throw serviceError;
      }

      console.log('Fetched service details:', serviceDetails);

      // Create a map of service details with categories
      const serviceDetailsMap = serviceDetails.reduce((acc: Record<string, any>, item) => {
        // Check item.category's structure and safely extract the category data
        // It could be an object with id/name properties or could have a different structure
        let categoryName = 'Other Items';
        let categoryId = null;
        
        if (item.category) {
          // If category is an object with direct properties
          if (typeof item.category === 'object' && !Array.isArray(item.category)) {
            // Use type assertion to tell TypeScript this is an object with name/id properties
            const categoryObj = item.category as { name?: string; id?: string };
            categoryName = categoryObj.name || categoryName;
            categoryId = categoryObj.id || categoryId;
          } 
          // If category is an array with a first element that has name/id
          else if (Array.isArray(item.category) && item.category.length > 0) {
            // Use a type guard to check properties exist
            const firstCategory = item.category[0];
            if (firstCategory && typeof firstCategory === 'object') {
              // Use 'in' operator to check if properties exist before accessing
              categoryName = 'name' in firstCategory ? String(firstCategory.name) : categoryName;
              categoryId = 'id' in firstCategory ? String(firstCategory.id) : categoryId;
            }
          }
        }
        
        acc[item.id] = {
          name: item.scope_of_work,
          unit: item.measuring_unit,
          categoryName: categoryName,
          categoryId: categoryId
        };
        
        return acc;
      }, {});

      console.log('Service details map:', serviceDetailsMap);

      // Update quotation data with service details
      const sanitizedQuotationData = {
        ...quotationData,
        totalAmount: parseFloat(quotationData.totalAmount) || 0,
        items: (quotationData.items || []).map((item: any) => {
          if (item.serviceDetails && item.serviceDetails.length > 0) {
            const serviceId = item.serviceDetails[0].serviceId;
            const serviceInfo = serviceDetailsMap[serviceId];
            return {
              ...item,
              amount: parseFloat(item.amount) || 0,
              category: serviceInfo?.categoryName || 'Other Items'
            };
          }
          return {
            ...item,
            amount: parseFloat(item.amount) || 0
          };
        }),
        margins: quotationData.margins || {},
        gstRate: quotationData.gstRate || 18,
        internalPricing: quotationData.internalPricing || false,
        serviceDetailsMap
      };

      // Store data for debugging
      if (typeof window !== 'undefined') {
        (window as any).currentQuotationData = {
          washrooms,
          allServiceIds,
          serviceDetails,
          serviceDetailsMap,
          sanitizedQuotationData
        };
      }

      // Generate HTML for the quotation
      const quotationHtml = await QuotationService.generateQuotationHtml(
        project, 
        sanitizedQuotationData,
        washrooms || []
      );

      // Get quotation count and generate number
      const { count, error: countError } = await supabase
        .from('project_quotations')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);
        
      if (countError) throw countError;
      
      const sequenceNumber = (count || 0) + 1;
      const quotationNumber = `QUO-${project.project_id}-${format(new Date(), 'yyyyMMdd')}-${sequenceNumber}`;
      
      // Get current user
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
      
      // Update project
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
    
    // Define category order
    const categoryOrder = [
      'Dismantling Works',
      'Plumbing Works',
      'Electrical Works',
      'Electrical Package',
      'False Ceiling',
      'Ledge Wall',
      'Tile Works',
      'Wall Plaster',
      'Paint Works'
    ];

    // Sort categories function
    const sortCategories = (a: string, b: string): number => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      
      // If both categories are not in the predefined order, sort alphabetically
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      
      // If one category is not in the order, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      // Sort according to predefined order
      return indexA - indexB;
    };

    // Calculate total area of all washrooms
    const totalArea = washrooms.reduce((sum, w) => sum + (w.length * w.width), 0);
    let subtotalBeforeGst = 0;
    let gstAmount = 0;
    let totalMrp = 0;

    // First pass to calculate totals
    washrooms.forEach(washroom => {
      const washroomItems = (quotationData.items || []).filter((item: any) => 
        item.washroomId === washroom.id || !item.washroomId
      );
      
      washroomItems.forEach((item: any) => {
        // For brand products, use direct values
        if (item.isBrandProduct) {
          subtotalBeforeGst += parseFloat(item.client_price) || 0;
          totalMrp += parseFloat(item.mrp) || 0;
        } else {
          // For services, apply margin
          const itemAmount = parseFloat(item.amount) || 0;
          subtotalBeforeGst += itemAmount;
          totalMrp += itemAmount * 1.2; // 20% markup for services only
        }

        if (item.applyGst !== false) {
          const amountForGst = item.isBrandProduct ? 
            (parseFloat(item.client_price) || 0) : 
            (parseFloat(item.amount) || 0);
          gstAmount += amountForGst * (quotationData.gstRate || 18) / 100;
        }
      });
    });

    const grandTotal = subtotalBeforeGst + gstAmount;

    // Debug the quotation data and service details map
    console.log("Generating HTML with serviceDetailsMap:", quotationData.serviceDetailsMap);

    // Group items by category for each washroom
    const washroomItemsByCategory: Record<string, Record<string, any[]>> = {};

    for (const washroom of washrooms) {
      const washroomItems = (quotationData.items || []).filter((item: any) => 
        item.washroomId === washroom.id || !item.washroomId
      );
      
      washroomItemsByCategory[washroom.id] = {};
      
      for (const item of washroomItems) {
        let categoryName;
        
        if (item.isCategory) {
          // For items that are already categories
          categoryName = item.name;
          console.log(`Category item: ${item.name}`);
        } else if (item.serviceDetails && item.serviceDetails.length > 0) {
          // For items with service details, use the category from the service details
          const firstServiceId = item.serviceDetails[0].serviceId;
          
          // Get the proper category from the service details map
          const serviceDetails = quotationData.serviceDetailsMap?.[firstServiceId];
          
          // Debug the category lookup
          console.log(`Looking for category of item ${item.name} with serviceId ${firstServiceId}:`, {
            serviceDetailsFound: !!serviceDetails,
            categoryFromMap: serviceDetails?.categoryName,
            fallbackCategory: item.category,
            finalCategory: serviceDetails?.categoryName || item.category || 'Other Items'
          });
          
          // Use the category name from the service details or fallback
          categoryName = serviceDetails?.categoryName || item.category || 'Other Items';
        } else {
          // For regular items
          categoryName = item.category || 'Other Items';
          console.log(`Regular item ${item.name} with category ${categoryName}`);
        }
        
        if (!washroomItemsByCategory[washroom.id][categoryName]) {
          washroomItemsByCategory[washroom.id][categoryName] = [];
        }
        
        if (item.isCategory && item.serviceDetails && item.serviceDetails.length > 0) {
          // For category items with service details, add each service detail separately
          for (const service of item.serviceDetails) {
            const serviceId = service.serviceId;
            const serviceDetails = quotationData.serviceDetailsMap?.[serviceId] || {};
            
            console.log(`Service detail for ${item.name}:`, {
              serviceId,
              detailsFound: !!serviceDetails,
              serviceName: serviceDetails.name || service.name,
              serviceUnit: serviceDetails.unit || service.unit
            });
            
            const serviceName = serviceDetails.name || service.name || `Service ${serviceId}`;
            const serviceUnit = serviceDetails.unit || service.unit || '';
            
            washroomItemsByCategory[washroom.id][categoryName].push({
              name: serviceName,
              unit: serviceUnit,
              description: '',
              amount: service.cost,
              mrp: service.cost * 1.2, // Apply markup only for services
              isService: true
            });
          }
        } else if (item.isBrandProduct) {
          // For brand products, use actual MRP and client_price directly
          washroomItemsByCategory[washroom.id][categoryName].push({
            ...item,
            mrp: item.mrp,
            amount: item.client_price
          });
        } else {
          // For services, apply standard markup
          washroomItemsByCategory[washroom.id][categoryName].push({
            ...item,
            mrp: item.amount * 1.2,
            amount: item.amount
          });
        }
      }
    }

    // Log the final categorized items for debugging
    console.log("Final washroom items by category:", 
      Object.keys(washroomItemsByCategory).map(washroomId => ({
        washroomId,
        categories: Object.keys(washroomItemsByCategory[washroomId])
      }))
    );

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
              
              // Sort categories according to defined order
              const sortedCategories = Object.keys(categoriesForWashroom).sort(sortCategories);
              
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
                          <th style="width: 30%">Category</th>
                          <th style="width: 35%">Item</th>
                          <th style="width: 17.5%; text-align: right;">MRP</th>
                          <th style="width: 17.5%; text-align: right;">YDS Offer</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${sortedCategories.map(category => {
                          const items = categoriesForWashroom[category];
                          return items.map((item, itemIndex) => {
                            const serviceInfo = item.serviceDetails?.[0]?.serviceId ? 
                              quotationData.serviceDetailsMap[item.serviceDetails[0].serviceId] : null;
                            
                            const displayCategory = serviceInfo?.categoryName || category;
                            const displayName = serviceInfo?.name || item.name;
                            const displayUnit = serviceInfo?.unit ? `(${serviceInfo.unit})` : '';
                            
                            const itemAmount = parseFloat(item.amount) || 0;
                            const itemMrp = parseFloat(item.mrp) || 0;
                            
                            return `
                              <tr>
                                <td>${itemIndex === 0 ? displayCategory : ''}</td>
                                <td>
                                  • ${displayName} ${displayUnit}
                                  ${item.isBrandProduct && itemMrp > itemAmount ? 
                                    `<br/><span style="color: #16a34a; font-size: 0.9em;">
                                      ${Math.round((1 - (itemAmount / itemMrp)) * 100)}% off
                                    </span>` : 
                                    ''}
                                </td>
                                <td style="text-align: right;">₹${formatAmount(itemMrp)}</td>
                                <td style="text-align: right;">₹${formatAmount(itemAmount)}</td>
                              </tr>
                            `;
                          }).join('');
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
   * Get a quotation by its quotation number
   */
  static async getQuotationByNumber(quotationNumber: string): Promise<ProjectQuotation | null> {
    try {
      const { data, error } = await supabase
        .from('project_quotations')
        .select('*')
        .eq('quotation_number', quotationNumber)
        .single();
      
      if (error) throw error;
      
      return data as ProjectQuotation;
    } catch (error: any) {
      console.error('Error fetching quotation by number:', error);
      toast({
        title: "Error",
        description: `Failed to fetch quotation ${quotationNumber}`,
        variant: "destructive",
      });
      return null;
    }
  }
}
