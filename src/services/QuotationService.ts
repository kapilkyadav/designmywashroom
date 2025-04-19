
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface QuotationData {
  projectId: string;
  items: QuotationItem[];
  subtotal: number;
  gst: number;
  total: number;
  terms?: string;
}

interface QuotationItem {
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isExecutionService: boolean;
}

export class QuotationService {
  static async generateQuotation(data: QuotationData) {
    try {
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('real_projects')
        .select('*')
        .eq('id', data.projectId)
        .single();

      if (projectError) throw projectError;

      // Generate unique quotation number
      const quotationNumber = `QUO-${project.project_id}-${format(new Date(), 'yyyyMMdd')}`;

      // Generate HTML content
      const htmlContent = await this.generateQuotationHtml(project, data);

      // Save quotation
      const { data: savedQuotation, error } = await supabase
        .from('project_quotations')
        .insert({
          project_id: data.projectId,
          quotation_number: quotationNumber,
          quotation_data: data,
          quotation_html: htmlContent,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Quotation generated",
        description: `Quotation ${quotationNumber} has been created successfully.`
      });

      return savedQuotation;
    } catch (error: any) {
      console.error('Error generating quotation:', error);
      toast({
        title: "Error generating quotation",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  }

  private static async generateQuotationHtml(project: any, data: QuotationData): Promise<string> {
    // Basic HTML template
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; }
            .total { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Quotation #${project.project_id}</h1>
            <p>Date: ${format(new Date(), 'dd/MM/yyyy')}</p>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.category}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.unitPrice.toFixed(2)}</td>
                  <td>₹${item.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <p>Subtotal: ₹${data.subtotal.toFixed(2)}</p>
            <p>GST (18%): ₹${data.gst.toFixed(2)}</p>
            <p>Total: ₹${data.total.toFixed(2)}</p>
          </div>

          <div class="terms">
            <h3>Terms & Conditions</h3>
            <p>${data.terms || 'Standard terms and conditions apply.'}</p>
          </div>
        </body>
      </html>
    `;
  }
}
