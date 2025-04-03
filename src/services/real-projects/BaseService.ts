
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { RealProject } from './types';

// Forward declaration for RealProjectService
// Will be set in index.ts to resolve circular dependency
export class RealProjectService {
  static updateRealProject: (id: string, project: Partial<RealProject>) => Promise<boolean>;
}

export class BaseService {
  /**
   * Handle errors consistently across all real project services
   */
  protected static handleError(error: any, title: string): never {
    console.error(`Error: ${title}`, error);
    toast({
      title,
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
    throw error;
  }

  /**
   * Add prototype methods to RealProject objects
   * Made public to allow access from RealProjectService
   */
  public static extendRealProject(project: RealProject): RealProject {
    return {
      ...project,
      updateCosts: async (costData) => {
        return RealProjectService.updateRealProject(project.id, costData);
      }
    };
  }
}
