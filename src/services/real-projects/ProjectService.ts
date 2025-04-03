import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { BaseService } from './BaseService';
import { RealProject, RealProjectFilter } from './types';
import { LeadCrudService } from '../leads/LeadCrudService';

export class ProjectService extends BaseService {
  /**
   * Get all real projects with filtering
   */
  static async getRealProjects(filters: RealProjectFilter = {}): Promise<{ data: RealProject[], count: number }> {
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
  }
  
  /**
   * Get a single real project by ID
   */
  static async getRealProject(id: string): Promise<RealProject | null> {
    try {
      // First, get the main project data
      const { data: projectData, error: projectError } = await supabase
        .from('real_projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (projectError) throw projectError;
      
      if (!projectData) return null;
      
      // Next, get the washrooms for this project
      const { data: washroomsData, error: washroomsError } = await supabase
        .from('project_washrooms')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });
      
      if (washroomsError) throw washroomsError;
      
      // Combine project and washrooms
      const project = {
        ...projectData,
        washrooms: washroomsData || []
      } as RealProject;
      
      return this.extendRealProject(project);
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch project details');
    }
  }
  
  /**
   * Update a real project
   */
  static async updateRealProject(id: string, project: Partial<RealProject>): Promise<boolean> {
    try {
      // Extract washrooms to handle separately
      const { washrooms, ...projectData } = project;
      
      // Update the main project
      const { error: projectError } = await supabase
        .from('real_projects')
        .update(projectData)
        .eq('id', id);
      
      if (projectError) throw projectError;
      
      // Handle washrooms update if provided
      if (washrooms && washrooms.length > 0) {
        // First delete existing washrooms
        await supabase
          .from('project_washrooms')
          .delete()
          .eq('project_id', id);
        
        // Then insert new washrooms
        const washroomsToInsert = washrooms.map(washroom => ({
          ...washroom,
          project_id: id
        }));
        
        const { error: washroomsError } = await supabase
          .from('project_washrooms')
          .insert(washroomsToInsert);
        
        if (washroomsError) throw washroomsError;
      }
      
      toast({
        title: "Project updated",
        description: "The project has been successfully updated.",
      });
      
      return true;
    } catch (error: any) {
      return this.handleError(error, 'Failed to update project');
    }
  }
  
  /**
   * Delete a real project
   */
  static async deleteRealProject(id: string): Promise<boolean> {
    try {
      // First delete any quotations associated with this project
      await supabase
        .from('project_quotations')
        .delete()
        .eq('project_id', id);
      
      // Delete any washrooms associated with this project
      await supabase
        .from('project_washrooms')
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
      return this.handleError(error, 'Failed to delete project');
    }
  }
  
  /**
   * Create a new real project directly
   */
  static async createRealProject(projectData: any): Promise<{ success: boolean, project: RealProject | null }> {
    try {
      const { data: newProject, error: projectError } = await supabase
        .from('real_projects')
        .insert({
          client_name: projectData.client_name,
          client_email: projectData.client_email || null,
          client_mobile: projectData.client_mobile,
          client_location: projectData.client_location || null,
          project_type: projectData.project_type,
          selected_brand: projectData.selected_brand || null,
          project_details: projectData.project_details || {},
          status: 'In Progress'
        })
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      toast({
        title: "Project created",
        description: `Successfully created project ${newProject.project_id}`,
      });
      
      return { success: true, project: newProject as RealProject };
    } catch (error: any) {
      console.error('Error creating real project:', error);
      toast({
        title: "Project creation failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, project: null };
    }
  }
}
