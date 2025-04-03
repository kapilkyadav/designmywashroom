
import { supabase } from '@/lib/supabase';
import { BaseService } from './BaseService';
import { Washroom } from './types';

export class WashroomService extends BaseService {
  /**
   * Add a washroom to a project
   */
  static async addWashroomToProject(projectId: string, washroom: Omit<Washroom, 'id' | 'created_at'>): Promise<Washroom> {
    try {
      const washroomData = {
        ...washroom,
        project_id: projectId,
        wall_area: washroom.wall_area || washroom.wallArea,
        ceiling_area: washroom.ceiling_area || washroom.ceilingArea
      };

      const { data, error } = await supabase
        .from('project_washrooms')
        .insert(washroomData)
        .select()
        .single();

      if (error) throw error;

      return data as Washroom;
    } catch (error: any) {
      return BaseService.handleError(error, 'Failed to add washroom');
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
        .eq('project_id', projectId);

      if (error) throw error;

      return data as Washroom[];
    } catch (error: any) {
      return BaseService.handleError(error, 'Failed to fetch washrooms');
    }
  }
}
