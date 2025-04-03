
import { supabase } from '@/lib/supabase';
import { ConvertibleRecord, RealProject } from './types';
import { LeadCrudService } from '../leads/LeadCrudService';
import { BaseService } from './BaseService';

export class ConversionService extends BaseService {
  /**
   * Fetch convertible records (leads and project estimates)
   */
  static async getConvertibleRecords(): Promise<ConvertibleRecord[]> {
    try {
      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, customer_name, phone, email, location, lead_date, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (leadsError) throw leadsError;
      
      // Fetch project estimates
      const { data: estimatesData, error: estimatesError } = await supabase
        .from('projects')
        .select('id, client_name, client_email, client_mobile, client_location, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (estimatesError) throw estimatesError;
      
      // Transform leads data
      const leads = leadsData.map(lead => ({
        record_type: 'lead' as const,
        record_id: lead.id,
        client_name: lead.customer_name,
        client_email: lead.email,
        client_mobile: lead.phone,
        client_location: lead.location,
        created_date: lead.lead_date || lead.created_at,
        status: lead.status,
        real_project_id: null
      }));
      
      // Transform project estimates data
      const estimates = estimatesData.map(estimate => ({
        record_type: 'project_estimate' as const,
        record_id: estimate.id,
        client_name: estimate.client_name,
        client_email: estimate.client_email,
        client_mobile: estimate.client_mobile,
        client_location: estimate.client_location,
        created_date: estimate.created_at,
        status: null,
        real_project_id: null
      }));
      
      // Combine and sort by created_date descending
      const records = [...leads, ...estimates].sort((a, b) => 
        new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );
      
      console.log('Fetched records:', records);
      return records as ConvertibleRecord[];
    } catch (error) {
      return this.handleError(error, 'Failed to fetch convertible records');
    }
  }
  
  /**
   * Convert a lead to a real project
   */
  static async convertLeadToProject(leadId: string, projectData: any): Promise<{ success: boolean; project: RealProject | null }> {
    try {
      // Create the new real project
      const { data: newProject, error: projectError } = await supabase
        .from('real_projects')
        .insert({
          ...projectData,
          lead_id: leadId,
          project_estimate_id: null,
        })
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // Mark the lead as converted
      await LeadCrudService.markLeadAsConverted(leadId, newProject.id);
      
      return { success: true, project: newProject as RealProject };
    } catch (error) {
      return this.handleError(error, 'Failed to convert lead to project');
    }
  }
  
  /**
   * Convert a project estimate to a real project
   */
  static async convertEstimateToProject(estimateId: string, projectData: any): Promise<{ success: boolean; project: RealProject | null }> {
    try {
      // Create the new real project
      const { data: newProject, error: projectError } = await supabase
        .from('real_projects')
        .insert({
          ...projectData,
          lead_id: null,
          project_estimate_id: estimateId,
        })
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      return { success: true, project: newProject as RealProject };
    } catch (error) {
      return this.handleError(error, 'Failed to convert estimate to project');
    }
  }
  
  /**
   * Generic method to convert any record to a real project
   */
  static async convertToProject(record: ConvertibleRecord): Promise<{ success: boolean; project: RealProject | null }> {
    try {
      // Create the new real project
      const { data: newProject, error: projectError } = await supabase
        .from('real_projects')
        .insert({
          client_name: record.client_name,
          client_email: record.client_email,
          client_mobile: record.client_mobile,
          client_location: record.client_location,
          project_type: 'new-construction',
          project_details: {},
          status: 'In Progress',
          // Set reference to original record
          lead_id: record.record_type === 'lead' ? record.record_id : null,
          project_estimate_id: record.record_type === 'project_estimate' ? record.record_id : null,
        })
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // If converting from a lead, mark the lead as converted
      if (record.record_type === 'lead') {
        await LeadCrudService.markLeadAsConverted(record.record_id, newProject.id);
      }
      
      return { success: true, project: newProject as RealProject };
    } catch (error) {
      return this.handleError(error, 'Failed to convert record to project');
    }
  }
}
