
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { BaseService } from './BaseService';
import { Washroom } from './types';

export class WashroomService extends BaseService {
  /**
   * Add a washroom to a project
   */
  static async addWashroomToProject(projectId: string, washroomData: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_washrooms')
        .insert({
          ...washroomData,
          project_id: projectId
        });
      
      if (error) throw error;
      
      // Update washroom count in project
      await supabase.rpc('increment_washroom_count', { 
        p_project_id: projectId 
      });
      
      return true;
    } catch (error: any) {
      return this.handleError(error, 'Failed to add washroom');
    }
  }

  /**
   * Get all washrooms for a project
   */
  static async getProjectWashrooms(projectId: string): Promise<Washroom[]> {
    try {
      const { data, error } = await supabase
        .from('project_washrooms')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data as Washroom[];
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch washrooms');
    }
  }
}
