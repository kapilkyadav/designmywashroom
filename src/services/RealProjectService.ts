import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Real Project Types
export interface RealProject {
  id: string;
  project_id: string;
  lead_id: string | null;
  project_estimate_id: string | null;
  client_name: string;
  client_email: string | null;
  client_mobile: string;
  client_location: string | null;
  project_type: string;
  project_details: Record<string, any>;
  selected_brand: string | null;
  length: number | null;
  width: number | null;
  height: number | null;
  selected_fixtures: Record<string, any> | null;
  original_estimate: number | null;
  execution_costs: Record<string, any>;
  vendor_rates: Record<string, any>;
  additional_costs: Record<string, any>;
  final_quotation_amount: number | null;
  status: string;
  internal_notes: string | null;
  converted_at: string;
  quotation_generated_at: string | null;
  last_updated_at: string;
  created_at: string;

  // Add a helper method to update costs more cleanly
  updateCosts: (data: {
    execution_costs: Record<string, any>;
    vendor_rates: Record<string, any>;
    additional_costs: Record<string, any>;
    final_quotation_amount: number;
  }) => Promise<boolean>;
}

export interface RealProjectFilter {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ConvertibleRecord {
  record_type: 'lead' | 'project_estimate';
  record_id: string;
  client_name: string;
  created_date: string;
  status: string | null;
  real_project_id: string | null;
}

export interface ProjectQuotation {
  id: string;
  project_id: string;
  quotation_number: string;
  quotation_data: Record<string, any>;
  quotation_html: string | null;
  created_by: string | null;
  created_at: string;
}

export const RealProjectService = {
  // Get all real projects with filtering
  async getRealProjects(filters: RealProjectFilter = {}): Promise<{ data: RealProject[], count: number }> {
    try {
      let query = supabase
        .from('real_projects')
        .select('*', { count: 'exact' });
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.dateFrom) {
        query = query.gte('converted_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('converted_at', filters.dateTo);
      }
      
      if (filters.search) {
        query = query.or(`client_name.ilike.%${filters.search}%,client_mobile.ilike.%${filters.search}%,project_id.ilike.%${filters.search}%`);
      }
      
      if (filters.sortBy) {
        const direction = filters.sortDirection || 'desc';
        query = query.order(filters.sortBy, { ascending: direction === 'asc' });
      } else {
        query = query.order('converted_at', { ascending: false });
      }
      
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const start = (page - 1) * pageSize;
      
      query = query.range(start, start + pageSize - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return { 
        data: data as RealProject[], 
        count: count || 0 
      };
    } catch (error: any) {
      console.error('Error fetching real projects:', error);
      toast({
        title: "Failed to fetch projects",
        description: error.message,
        variant: "destructive",
      });
      return { data: [], count: 0 };
    }
  },
  
  // Get a single real project by ID
  async getRealProject(id: string): Promise<RealProject | null> {
    try {
      const { data, error } = await supabase
        .from('real_projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data ? RealProjectService.extendRealProject(data as RealProject) : null;
    } catch (error: any) {
      console.error('Error fetching real project:', error);
      toast({
        title: "Failed to fetch project details",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Update a real project
  async updateRealProject(id: string, project: Partial<RealProject>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('real_projects')
        .update(project)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Project updated",
        description: "The project has been successfully updated.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating real project:', error);
      toast({
        title: "Failed to update project",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Delete a real project
  async deleteRealProject(id: string): Promise<boolean> {
    try {
      // First delete any quotations associated with this project
      await supabase
        .from('project_quotations')
        .delete()
        .eq('project_id', id);
      
      // Then delete the project
      const { error } = await supabase
        .from('real_projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting real project:', error);
      toast({
        title: "Failed to delete project",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Get convertible records (leads and project estimates that can be converted)
  async getConvertibleRecords(): Promise<ConvertibleRecord[]> {
    try {
      const { data, error } = await supabase
        .from('convertible_records')
        .select('*')
        .order('created_date', { ascending: false });
      
      if (error) throw error;
      
      return data as ConvertibleRecord[];
    } catch (error: any) {
      console.error('Error fetching convertible records:', error);
      toast({
        title: "Failed to fetch records",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  },
  
  // Convert a lead to a real project
  async convertLeadToRealProject(leadId: string): Promise<{ success: boolean, project: RealProject | null }> {
    try {
      // First, get the lead details
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();
      
      if (leadError) throw leadError;
      
      // Create a new real project from the lead data
      const projectData = {
        lead_id: leadId,
        client_name: lead.customer_name,
        client_email: lead.email,
        client_mobile: lead.phone,
        client_location: lead.location,
        project_type: 'Not Specified', // Default value as leads might not have this info
        project_details: {} as Record<string, any>,
        status: 'In Progress'
      };
      
      const { data: newProject, error: projectError } = await supabase
        .from('real_projects')
        .insert(projectData)
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      toast({
        title: "Lead converted",
        description: `Successfully created project ${newProject.project_id}`,
      });
      
      return { success: true, project: newProject as RealProject };
    } catch (error: any) {
      console.error('Error converting lead to real project:', error);
      toast({
        title: "Conversion failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, project: null };
    }
  },
  
  // Convert a project estimate to a real project
  async convertEstimateToRealProject(estimateId: string): Promise<{ success: boolean, project: RealProject | null }> {
    try {
      // First, get the project estimate details
      const { data: estimate, error: estimateError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', estimateId)
        .single();
      
      if (estimateError) throw estimateError;
      
      // Create a new real project from the project estimate data
      const projectData = {
        project_estimate_id: estimateId,
        client_name: estimate.client_name,
        client_email: estimate.client_email,
        client_mobile: estimate.client_mobile,
        client_location: estimate.client_location,
        project_type: estimate.project_type,
        selected_brand: estimate.selected_brand,
        length: estimate.length,
        width: estimate.width,
        height: estimate.height,
        selected_fixtures: estimate.selected_fixtures,
        original_estimate: estimate.final_estimate,
        project_details: {
          timeline: estimate.timeline,
          fixture_cost: estimate.fixture_cost,
          plumbing_cost: estimate.plumbing_cost,
          tiling_cost: estimate.tiling_cost || 0,
        },
        status: 'In Progress'
      };
      
      const { data: newProject, error: projectError } = await supabase
        .from('real_projects')
        .insert(projectData)
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      toast({
        title: "Estimate converted",
        description: `Successfully created project ${newProject.project_id}`,
      });
      
      return { success: true, project: newProject as RealProject };
    } catch (error: any) {
      console.error('Error converting estimate to real project:', error);
      toast({
        title: "Conversion failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, project: null };
    }
  },
  
  // Generate and save a quotation for a project
  async generateQuotation(projectId: string, quotationData: Record<string, any>): Promise<{ success: boolean, quotation: ProjectQuotation | null }> {
    try {
      // Get the project details to include in the quotation
      const { data: project, error: projectError } = await supabase
        .from('real_projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // Generate HTML for the quotation
      const quotationHtml = this.generateQuotationHtml(project, quotationData);
      
      // Create a quotation number
      const quotationNumber = `QUO-${project.project_id}-${format(new Date(), 'yyyyMMdd')}`;
      
      // Get the current user's session
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      // Save the quotation
      const quotationToSave = {
        project_id: projectId,
        quotation_number: quotationNumber,
        quotation_data: quotationData,
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
          final_quotation_amount: quotationData.totalAmount || project.final_quotation_amount
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
        title: "Failed to generate quotation",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, quotation: null };
    }
  },
  
  // Helper function to generate HTML for quotation
  generateQuotationHtml(project: RealProject, quotationData: Record<string, any>): string {
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
              ${quotationData.items?.map((item: any) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.description}</td>
                  <td>₹${item.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="total">
            <p>Total Amount: ₹${(quotationData.totalAmount || 0).toLocaleString('en-IN')}</p>
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
  },
  
  // Get all quotations for a project
  async getProjectQuotations(projectId: string): Promise<ProjectQuotation[]> {
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
      toast({
        title: "Failed to fetch quotations",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  },
  
  // Get a single quotation by ID
  async getQuotation(quotationId: string): Promise<ProjectQuotation | null> {
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
        title: "Failed to fetch quotation",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  },
  
  // Add prototype methods to RealProject objects
  extendRealProject(project: RealProject): RealProject {
    return {
      ...project,
      updateCosts: async (costData) => {
        return RealProjectService.updateRealProject(project.id, costData);
      }
    };
  }
};
