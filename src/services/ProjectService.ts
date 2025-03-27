
import { supabase, Project } from '@/lib/supabase';
import { CacheManager } from '@/lib/cache';

// Rate limiter for project creation
// Store email -> timestamp mapping to track submission frequency
const submissionRateLimiter = new CacheManager<number>(5 * 60 * 1000); // 5 minute cache

export const ProjectService = {
  // Get all projects
  async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
    
    return data as Project[];
  },
  
  // Get a project by ID
  async getProjectById(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
    
    return data as Project;
  },
  
  // Check if a user is submitting too frequently
  isRateLimited(email: string): boolean {
    if (!email) return false;
    
    const key = `submission_${email.toLowerCase()}`;
    const lastSubmission = submissionRateLimiter.get(key);
    const now = Date.now();
    
    // If we have a previous submission within the last 2 minutes, rate limit
    if (lastSubmission && (now - lastSubmission < 2 * 60 * 1000)) {
      console.log(`Rate limiting submission for ${email}, last submission at ${new Date(lastSubmission).toISOString()}`);
      return true;
    }
    
    // Update the last submission time
    submissionRateLimiter.set(key, now);
    return false;
  },
  
  // Create a new project from calculator submission
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    // Check rate limiting
    if (project.client_email && this.isRateLimited(project.client_email)) {
      throw new Error('RATE_LIMITED');
    }
    
    // Ensure all string fields have valid values or empty strings, not null/undefined
    const sanitizedProject = {
      ...project,
      client_name: project.client_name || '',
      client_email: project.client_email || '',
      client_mobile: project.client_mobile || '',
      client_location: project.client_location || '',
      project_type: project.project_type || 'new-construction',
      selected_brand: project.selected_brand || ''
    };
    
    console.log('Creating project with data:', sanitizedProject);
    
    const { data, error } = await supabase
      .from('projects')
      .insert(sanitizedProject)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }
    
    return data as Project;
  },
  
  // Update a project
  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    // Sanitize any potential undefined/null values for string fields
    const updateData = { ...project };
    
    if ('client_name' in updateData && !updateData.client_name) {
      updateData.client_name = '';
    }
    if ('client_email' in updateData && !updateData.client_email) {
      updateData.client_email = '';
    }
    if ('client_mobile' in updateData && !updateData.client_mobile) {
      updateData.client_mobile = '';
    }
    if ('client_location' in updateData && !updateData.client_location) {
      updateData.client_location = '';
    }
    
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
    
    return data as Project;
  },
  
  // Delete a project
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};
