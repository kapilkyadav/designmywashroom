
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BaseService } from './BaseService';
import { ProjectQuotation, RealProject, Washroom } from './types';
import { VendorRateCardService } from '@/services/VendorRateCardService';

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
      // Fix: Use the class name directly instead of 'this'
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
    // Format value with safe number handling
    const formatAmount = (value: any): string => {
      if (value === undefined || value === null) return '0';
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(numValue) ? '0' : numValue.toLocaleString('en-IN');
    };
    
    // Create a basic HTML template for the quotation
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quotation ${project.project_id}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .quotation-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .client-info, .project-info { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; text-align: right; margin-top: 20px; }
          .footer { margin-top: 40px; font-size: 12px; text-align: center; color: #666; }
          .washroom-details { margin-bottom: 30px; }
          .washroom-details h3 { border-bottom: 1px solid #eee; padding-bottom: 5px; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .container { max-width: 100%; }
            .footer { position: fixed; bottom: 20px; left: 0; right: 0; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Quotation</h1>
            <h2>${project.project_id}</h2>
          </div>
          
          <div class="quotation-info">
            <div class="client-info">
              <h3>Client Information</h3>
              <p><strong>Name:</strong> ${project.client_name}</p>
              <p><strong>Email:</strong> ${project.client_email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${project.client_mobile}</p>
              <p><strong>Location:</strong> ${project.client_location || 'N/A'}</p>
            </div>
            
            <div class="project-info">
              <h3>Project Information</h3>
              <p><strong>Project ID:</strong> ${project.project_id}</p>
              <p><strong>Date:</strong> ${format(new Date(project.last_updated_at), 'dd/MM/yyyy')}</p>
              <p><strong>Project Type:</strong> ${project.project_type}</p>
              <p><strong>Brand:</strong> ${project.selected_brand || 'N/A'}</p>
            </div>
          </div>
          
          <div class="washroom-details">
            <h3>Washroom Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Washroom</th>
                  <th>Dimensions</th>
                  <th>Area (sq ft)</th>
                </tr>
              </thead>
              <tbody>
                ${washrooms.map(washroom => {
                  const length = washroom.length || 0;
                  const width = washroom.width || 0;
                  const height = washroom.height || 0;
                  return `
                    <tr>
                      <td>${washroom.name || 'Washroom'}</td>
                      <td>${length}' × ${width}' × ${height}'</td>
                      <td>${(length * width) || 0} sq ft</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          
          <h3>Quotation Details</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${(quotationData.items || []).map((item: any) => `
                <tr>
                  <td>${item.name || ''}</td>
                  <td>${item.description || ''}</td>
                  <td>₹${formatAmount(item.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total Amount: ₹${formatAmount(quotationData.totalAmount)}</p>
          </div>
          
          <div class="terms">
            <h3>Terms & Conditions</h3>
            <p>${quotationData.terms || 'Standard terms and conditions apply.'}</p>
          </div>
          
          <div class="footer">
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
