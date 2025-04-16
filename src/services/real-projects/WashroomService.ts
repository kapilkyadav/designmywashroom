import { supabase } from '@/lib/supabase';
import { BaseService } from './BaseService';
import { Washroom, NewWashroom } from './types';

export class WashroomService extends BaseService {
  /**
   * Add a washroom to a project
   */
  static async addWashroomToProject(projectId: string, washroom: NewWashroom): Promise<Washroom> {
    try {
      // Calculate areas if not provided
      const calculatedWashroom = WashroomService.calculateWashroomAreas(washroom);
      
      // Prepare washroom data
      const washroomData = {
        project_id: projectId,
        name: calculatedWashroom.name,
        length: calculatedWashroom.length,
        width: calculatedWashroom.width,
        height: calculatedWashroom.height,
        wall_area: calculatedWashroom.wall_area || calculatedWashroom.wallArea,
        ceiling_area: calculatedWashroom.ceiling_area || calculatedWashroom.ceilingArea,
        services: calculatedWashroom.services || {},
        service_details: calculatedWashroom.service_details || {},
        selected_brand: calculatedWashroom.selected_brand
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
        
        // Calculate areas if needed
        const calculatedWashroom = WashroomService.calculateWashroomAreas(washroom);
        
        // Prepare washroom data for update
        const washroomData = {
          project_id: projectId,
          name: calculatedWashroom.name,
          length: calculatedWashroom.length,
          width: calculatedWashroom.width,
          height: calculatedWashroom.height,
          wall_area: calculatedWashroom.wall_area || calculatedWashroom.wallArea,
          ceiling_area: calculatedWashroom.ceiling_area || calculatedWashroom.ceilingArea,
          services: calculatedWashroom.services || {},
          service_details: calculatedWashroom.service_details || {},
          selected_brand: calculatedWashroom.selected_brand
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

  /**
   * Helper method to calculate washroom areas
   */
  static calculateWashroomAreas<T extends Pick<Washroom, 'length' | 'width' | 'height' | 'wall_area' | 'ceiling_area' | 'wallArea' | 'ceilingArea'>>(washroom: T): T & { area: number, wall_area: number, ceiling_area: number, total_area: number } {
    // Calculate floor area
    const floorArea = washroom.length * washroom.width;
    
    // Calculate wall area if not manually set or dimensions changed
    let wallArea = washroom.wall_area || 0;
    if (washroom.length > 0 && washroom.width > 0 && washroom.height > 0) {
      // Perimeter × height = wall area
      const perimeter = 2 * (Number(washroom.length) + Number(washroom.width));
      wallArea = perimeter * Number(washroom.height);
    }
    
    // Set ceiling area to match floor area if not manually set
    const ceilingArea = washroom.ceiling_area || floorArea;
    
    // Calculate total area (Floor Area + Wall Area)
    const totalArea = floorArea + wallArea;
    
    return {
      ...washroom,
      area: floorArea,
      wall_area: wallArea,
      ceiling_area: ceilingArea,
      total_area: totalArea
    };
  }
}
