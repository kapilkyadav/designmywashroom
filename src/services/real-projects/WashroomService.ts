
import { supabase } from '@/lib/supabase';
import { BaseService } from './BaseService';
import { Washroom } from './types';

export class WashroomService extends BaseService {
  /**
   * Add a washroom to a project
   */
  static async addWashroomToProject(projectId: string, washroom: Omit<Washroom, 'id' | 'created_at'>): Promise<Washroom> {
    try {
      // Prepare washroom data, excluding the 'area' field which is generated in the database
      const washroomData = {
        project_id: projectId,
        name: washroom.name,
        length: washroom.length,
        width: washroom.width,
        height: washroom.height,
        wall_area: washroom.wall_area || washroom.wallArea,
        ceiling_area: washroom.ceiling_area || washroom.ceilingArea,
        services: washroom.services || {},
        selected_brand: washroom.selected_brand
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
  
  /**
   * Update washrooms for a project
   */
  static async updateProjectWashrooms(projectId: string, washrooms: Washroom[]): Promise<boolean> {
    try {
      // First, get existing washrooms to determine which ones to update/delete/insert
      const { data: existingWashrooms, error: fetchError } = await supabase
        .from('project_washrooms')
        .select('id')
        .eq('project_id', projectId);
      
      if (fetchError) throw fetchError;
      
      const existingIds = new Set((existingWashrooms || []).map(w => w.id));
      
      // Process each washroom
      for (const washroom of washrooms) {
        // Remove temp- prefix from IDs if present
        const washroomId = washroom.id.startsWith('temp-') ? washroom.id.substring(5) : washroom.id;
        
        // Prepare washroom data for update, excluding the 'area' field
        const washroomData = {
          project_id: projectId,
          name: washroom.name,
          length: washroom.length,
          width: washroom.width,
          height: washroom.height,
          services: washroom.services || {},
          selected_brand: washroom.selected_brand
        };
        
        // If it exists in DB, update it
        if (existingIds.has(washroomId) && !washroom.id.startsWith('temp-')) {
          const { error } = await supabase
            .from('project_washrooms')
            .update(washroomData)
            .eq('id', washroomId);
          
          if (error) throw error;
          existingIds.delete(washroomId);
        } 
        // Otherwise insert new washroom
        else {
          const { error } = await supabase
            .from('project_washrooms')
            .insert(washroomData);
          
          if (error) throw error;
        }
      }
      
      // Delete washrooms that are in DB but not in the current list
      if (existingIds.size > 0) {
        const { error } = await supabase
          .from('project_washrooms')
          .delete()
          .in('id', Array.from(existingIds));
        
        if (error) throw error;
      }
      
      return true;
    } catch (error: any) {
      return BaseService.handleError(error, 'Failed to update washrooms');
    }
  }
}
