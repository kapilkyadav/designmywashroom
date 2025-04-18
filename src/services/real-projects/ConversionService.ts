
import { supabase } from '@/lib/supabase';
import { BaseService } from './BaseService';
import { ConvertibleRecord } from './types';
import { toast } from '@/hooks/use-toast';

export class ConversionService extends BaseService {
  /**
   * Get leads and project estimates that can be converted to real projects
   */
  static async getConvertibleRecords(): Promise<ConvertibleRecord[]> {
    try {
      console.log("Fetching convertible records...");
      
      // Get leads that haven't been converted yet
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, customer_name, phone, email, location, created_at, status')
        .order('created_at', { ascending: false });
      
      if (leadsError) {
        console.error("Error fetching leads:", leadsError);
        throw leadsError;
      }
      
      // Get project estimates - don't filter by real_project_id since it doesn't exist
      const { data: estimates, error: estimatesError } = await supabase
        .from('projects')
        .select('id, client_name, client_email, client_mobile, client_location, created_at')
        .order('created_at', { ascending: false });
      
      if (estimatesError) {
        console.error("Error fetching project estimates:", estimatesError);
        throw estimatesError;
      }
      
      console.log("Fetched leads:", leads?.length || 0);
      console.log("Fetched estimates:", estimates?.length || 0);
      
      // Convert leads to standardized format
      const convertibleLeads = (leads || [])
        .map(lead => ({
          record_type: 'lead' as const,
          record_id: lead.id,
          client_name: lead.customer_name || '',
          client_email: lead.email || '',
          client_mobile: lead.phone || '',
          client_location: lead.location || '',
          created_date: lead.created_at,
          status: lead.status,
          real_project_id: null
        }));
      
      // Convert estimates to standardized format without filtering
      const convertibleEstimates = (estimates || [])
        .map(estimate => ({
          record_type: 'project_estimate' as const,
          record_id: estimate.id,
          client_name: estimate.client_name || '',
          client_email: estimate.client_email || '',
          client_mobile: estimate.client_mobile || '',
          client_location: estimate.client_location || '',
          created_date: estimate.created_at,
          status: null,
          real_project_id: null
        }));
      
      const allRecords = [...convertibleLeads, ...convertibleEstimates];
      console.log("Total convertible records:", allRecords.length);
      
      return allRecords;
    } catch (error: any) {
      console.error("Error in getConvertibleRecords:", error);
      return [];
    }
  }
  
  /**
   * Convert a record to a real project
   */
  static async convertToProject(record: ConvertibleRecord, additionalData?: Record<string, any>) {
    if (record.record_type === 'lead') {
      return this.convertLeadToRealProject(record.record_id, additionalData);
    } else if (record.record_type === 'project_estimate') {
      return this.convertEstimateToRealProject(record.record_id, additionalData);
    } else {
      throw new Error('Invalid record type');
    }
  }
  
  /**
   * Convert a lead to a real project
   */
  static async convertLeadToRealProject(leadId: string, additionalData?: Record<string, any>) {
    try {
      // Get the lead
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();
      
      if (leadError) throw leadError;
      
      // Create a real project from the lead
      const projectData = {
        client_name: lead.customer_name,
        client_email: lead.email,
        client_mobile: lead.phone,
        client_location: lead.location,
        lead_id: leadId,
        project_type: additionalData?.project_type || 'Remodeling',
        selected_brand: additionalData?.selected_brand || null,
        project_details: additionalData?.project_details || {},
        status: 'In Progress',
        internal_notes: `Converted from lead on ${new Date().toISOString()}`
      };
      
      const { data: project, error: projectError } = await supabase
        .from('real_projects')
        .insert(projectData)
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // Update the lead status to converted
      await supabase
        .from('leads')
        .update({ 
          status: 'Converted',
          remarks: `Converted to Project ${project.project_id} on ${new Date().toLocaleDateString()}`
        })
        .eq('id', leadId);
      
      return project;
    } catch (error: any) {
      console.error("Error converting lead to project:", error);
      throw new Error(`Failed to convert lead to real project: ${error.message}`);
    }
  }
  
  /**
   * Convert a project estimate to a real project
   */
  static async convertEstimateToRealProject(estimateId: string, additionalData?: Record<string, any>) {
    try {
      // Get the project estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', estimateId)
        .single();
      
      if (estimateError) throw estimateError;
      
      // Create a real project from the estimate
      const projectData = {
        client_name: estimate.client_name,
        client_email: estimate.client_email,
        client_mobile: estimate.client_mobile,
        client_location: estimate.client_location,
        project_estimate_id: estimateId,
        project_type: estimate.project_type,
        selected_brand: estimate.selected_brand,
        length: estimate.length,
        width: estimate.width,
        height: estimate.height,
        original_estimate: estimate.final_estimate,
        selected_fixtures: estimate.selected_fixtures,
        project_details: additionalData?.project_details || {},
        status: 'In Progress',
        internal_notes: `Converted from project estimate on ${new Date().toISOString()}`
      };
      
      const { data: project, error: projectError } = await supabase
        .from('real_projects')
        .insert(projectData)
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // We don't need to update the project estimate with real_project_id
      // as this column doesn't exist
      
      return project;
    } catch (error: any) {
      console.error("Error converting estimate to project:", error);
      throw new Error(`Failed to convert estimate to real project: ${error.message}`);
    }
  }

  /**
   * Handle error and display toast
   * Throws the error after displaying toast to match BaseService behavior
   */
  static handleError(error: any, defaultMessage: string): never {
    console.error(defaultMessage, error);
    toast({
      title: "Error",
      description: error.message || defaultMessage,
      variant: "destructive"
    });
    throw error;  // This ensures the method returns 'never' type
  }
}
