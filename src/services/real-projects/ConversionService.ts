
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { BaseService } from './BaseService';
import { ConvertibleRecord, RealProject } from './types';
import { LeadCrudService } from '../leads/LeadCrudService';

export class ConversionService extends BaseService {
  /**
   * Get convertible records (leads and project estimates that can be converted)
   */
  static async getConvertibleRecords(): Promise<ConvertibleRecord[]> {
    try {
      const { data, error } = await supabase
        .from('convertible_records')
        .select('*')
        .order('created_date', { ascending: false });
      
      if (error) throw error;
      
      console.log("Fetched convertible records:", data);
      
      // Make sure we have the required fields
      const processedData = data.map((record: any) => ({
        ...record,
        client_name: record.client_name || "No Name",
        client_email: record.client_email || null,
        client_mobile: record.client_mobile || null,
        client_location: record.client_location || null
      }));
      
      return processedData as ConvertibleRecord[];
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch records');
    }
  }
  
  /**
   * Convert a lead to a real project with extended data
   */
  static async convertLeadToRealProject(
    leadId: string, 
    projectData?: any
  ): Promise<{ success: boolean, project: RealProject | null }> {
    try {
      // First, get the lead details
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();
      
      if (leadError) throw leadError;
      
      // Create a new real project from the lead data
      const dataToInsert = projectData ? {
        lead_id: leadId,
        ...projectData
      } : {
        lead_id: leadId,
        client_name: lead.customer_name,
        client_email: lead.email,
        client_mobile: lead.phone,
        client_location: lead.location,
        project_type: 'Not Specified', // Default value as leads might not have this info
        project_details: {}, // Empty object as default
        status: 'In Progress'
      };
      
      const { data: newProject, error: projectError } = await supabase
        .from('real_projects')
        .insert(dataToInsert)
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // Only create default washroom if not provided through projectData
      if (!projectData) {
        // Create default washroom
        const washroom = {
          project_id: newProject.id,
          name: "Washroom 1",
          length: newProject.length || 0,
          width: newProject.width || 0,
          height: newProject.height || 9,
          area: (newProject.length || 0) * (newProject.width || 0),
          services: {}
        };
        
        await supabase
          .from('project_washrooms')
          .insert(washroom);
      }
      
      // Mark the lead as converted
      await LeadCrudService.markLeadAsConverted(leadId, newProject.project_id);
      
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
  }
  
  /**
   * Convert a project estimate to a real project with extended data
   */
  static async convertEstimateToRealProject(
    estimateId: string,
    projectData?: any
  ): Promise<{ success: boolean, project: RealProject | null }> {
    try {
      // First, get the project estimate details
      const { data: estimate, error: estimateError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', estimateId)
        .single();
      
      if (estimateError) throw estimateError;
      
      // Create a new real project from the project estimate data
      const dataToInsert = projectData ? {
        project_estimate_id: estimateId,
        ...projectData,
        original_estimate: estimate.final_estimate,
      } : {
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
        .insert(dataToInsert)
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // Only create default washroom if not provided through projectData
      if (!projectData) {
        // Create default washroom
        const washroom = {
          project_id: newProject.id,
          name: "Washroom 1",
          length: newProject.length || 0,
          width: newProject.width || 0,
          height: newProject.height || 9,
          area: (newProject.length || 0) * (newProject.width || 0),
          services: {}
        };
        
        await supabase
          .from('project_washrooms')
          .insert(washroom);
      }
      
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
  }
}
