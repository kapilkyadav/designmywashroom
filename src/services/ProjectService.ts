
import { supabase, Project } from '@/lib/supabase';
import { RateLimiter } from '@/lib/rateLimiter';

// Rate limiter for project creation - temporarily disabled for testing
// Store email -> timestamp mapping to track submission frequency
// 5 minute cache with 1 minute rate limit (reduced from 2 minutes)
const submissionRateLimiter = new RateLimiter(5 * 60 * 1000);

export const ProjectService = {
  // Get all projects
  async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
      
      return data as Project[];
    } catch (error) {
      console.error('Error in getAllProjects:', error);
      throw error;
    }
  },
  
  // Get a project by ID
  async getProjectById(id: string): Promise<Project> {
    try {
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
    } catch (error) {
      console.error('Error in getProjectById:', error);
      throw error;
    }
  },
  
  // Check if a user is submitting too frequently - temporarily disabled for testing
  isRateLimited(email: string): boolean {
    // Always return false to disable rate limiting for testing
    console.log(`Rate limiting temporarily disabled for testing. Email: ${email}`);
    return false;
  },
  
  // Create a new project from calculator submission
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    try {
      // Rate limiting check disabled for testing
      
      // Debug: Log the incoming project data
      console.log('Creating project with raw data:', JSON.stringify(project));
      
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
      
      console.log('Creating project with sanitized data:', sanitizedProject);
      
      // Check for empty strings in critical fields to help debug
      if (!sanitizedProject.client_name || !sanitizedProject.client_email) {
        console.warn('Warning: Creating project with empty client details', {
          name: sanitizedProject.client_name,
          email: sanitizedProject.client_email,
          mobile: sanitizedProject.client_mobile,
          location: sanitizedProject.client_location
        });
      }
      
      const { data, error } = await supabase
        .from('projects')
        .insert(sanitizedProject)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating project in Supabase:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No data returned from Supabase after project creation.');
        throw new Error('No data returned from database');
      }
      
      // Debug: Log the created project data from database
      console.log('Project created successfully:', data);
      
      return data as Project;
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  },
  
  // Update a project
  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    try {
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
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  },
  
  // Delete a project
  async deleteProject(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  }
};
