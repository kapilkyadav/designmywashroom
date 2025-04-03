
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { RealProject } from './types';

export class BaseService {
  /**
   * Handle errors consistently across all real project services
   */
  protected static handleError(error: any, title: string, fallbackValue?: any): any {
    console.error(`Error: ${title}`, error);
    toast({
      title,
      description: error.message,
      variant: "destructive",
    });
    if (fallbackValue !== undefined) {
      return fallbackValue;
    }
    throw error;
  }

  /**
   * Add prototype methods to RealProject objects
   */
  public static extendRealProject(project: RealProject): RealProject {
    return {
      ...project,
      updateCosts: async (costData) => {
        try {
          const { data, error } = await supabase
            .from('real_projects')
            .update(costData)
            .eq('id', project.id)
            .select()
            .single();

          if (error) throw error;
          return data as RealProject;
        } catch (error) {
          console.error('Error updating project costs:', error);
          toast({
            title: "Failed to update project costs",
            description: error.message || "An error occurred",
            variant: "destructive",
          });
          return project;
        }
      }
    };
  }
}

// Temporary circular dependency solution
// Will be imported from the index file later
export class RealProjectService {}
