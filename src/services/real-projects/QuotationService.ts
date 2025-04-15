import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BaseService } from './BaseService';
import { ProjectQuotation, RealProject, Washroom } from './types';

export class QuotationService extends BaseService {
  /**
   * Generate and save a quotation for a project
   */
  static async generateQuotation(projectId: string, quotationData: Record<string, any>): Promise<{ success: boolean, quotation: ProjectQuotation | null }> {
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
        }))
      };
      
      // Generate HTML for the quotation with washroom details
      const quotationHtml = QuotationService.generateQuotationHtml(project, sanitizedQuotationData, washrooms || []);
      
      // Create a quotation number
      const quotationNumber = `QUO-${project.project_id}-${format(new Date(), 'yyyyMMdd')}`;
      
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
   * Helper function to generate HTML for quotation
   */
  static generateQuotationHtml(project: RealProject, quotationData: Record<string, any>, washrooms: Washroom[]): string {
    const formatAmount = (value: any): string => {
      if (value === undefined || value === null) return '0';
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(numValue) ? '0' : numValue.toLocaleString('en-IN');
    };
    
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
          
          .washroom-table {
            width: 100%;
            margin-bottom: 30px;
            border-collapse: collapse;
          }
          
          .washroom-table th {
            background-color: var(--primary-color);
            color: white;
            text-align: left;
            padding: 12px;
          }
          
          .washroom-table td {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
          }
          
          .washroom-table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          
          .items-table {
            width: 100%;
            margin-bottom: 30px;
            border-collapse: collapse;
          }
          
          .items-table th {
            background-color: var(--primary-color);
            color: white;
            text-align: left;
            padding: 12px;
          }
          
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
          }
          
          .items-table tr:nth-child(even) {
            background-color: #f8fafc;
          }
          
          .total-section {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: 600;
            font-size: 18px;
            color: var(--primary-color);
          }
          
          .terms-section {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
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
          
          .product-list {
            margin-top: 40px;
          }
          
          .product-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .product-table th {
            background-color: var(--primary-color);
            color: white;
            text-align: left;
            padding: 12px;
          }
          
          .product-table td {
            padding: 12px;
            border-bottom: 1px solid var(--border-color);
            vertical-align: middle;
          }
          
          .product-table img {
            max-width: 60px;
            height: auto;
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
              <p><strong>Brand:</strong> ${project.selected_brand || 'N/A'}</p>
            </div>
          </div>
          
          <div class="washrooms-section">
            <h3 class="section-title">Washroom Details</h3>
            <table class="washroom-table">
              <thead>
                <tr>
                  <th>Washroom</th>
                  <th>Dimensions</th>
                  <th>Area (sq ft)</th>
                </tr>
              </thead>
              <tbody>
                ${washrooms.map((washroom) => `
                  <tr>
                    <td>${washroom.name || 'Washroom'}</td>
                    <td>${washroom.length}' × ${washroom.width}' × ${washroom.height}'</td>
                    <td>${(washroom.length * washroom.width).toFixed(2)} sq ft</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="items-section">
            <h3 class="section-title">Quotation Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th style="text-align: right;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${(quotationData.items || []).map((item: any) => `
                  <tr>
                    <td>${item.name || ''}</td>
                    <td>${item.description || ''}</td>
                    <td style="text-align: right;">₹${formatAmount(item.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="total-section">
            <div class="total-row">
              <span>Total Amount:</span>
              <span>₹${formatAmount(quotationData.totalAmount)}</span>
            </div>
          </div>
          
          <div class="terms-section">
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
