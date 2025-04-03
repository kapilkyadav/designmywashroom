
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { RealProject } from './types';

export class BaseService {
  /**
   * Handle errors consistently across all real project services
   */
  protected static handleError(error: any, title: string): never {
    console.error(`Error: ${title}`, error);
    toast({
      title,
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }

  /**
   * Add prototype methods to RealProject objects
   */
  protected static extendRealProject(project: RealProject): RealProject {
    return {
      ...project,
      updateCosts: async (costData) => {
        return RealProjectService.updateRealProject(project.id, costData);
      }
    };
  }
}

// Temporary circular dependency solution
// Will be imported from the index file later
export class RealProjectService {}
