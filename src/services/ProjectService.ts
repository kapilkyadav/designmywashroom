
import { supabase, Project } from '@/lib/supabase';
import { RateLimiter } from '@/lib/rateLimiter';

// Rate limiter for project creation
// Store email -> timestamp mapping to track submission frequency
// 5 minute cache with 1 minute rate limit (reduced from 2 minutes)
const submissionRateLimiter = new RateLimiter(5 * 60 * 1000);

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
    if (!email || email.trim() === '') {
      console.log('Empty email provided for rate limiting check, not limiting');
      return false;
    }
    
    // Normalize the email by trimming and converting to lowercase
    const normalizedEmail = email.trim().toLowerCase();
    const key = `submission_${normalizedEmail}`;
    
    // Reduced cooldown period to 1 minute for testing
    const cooldownPeriod = 60 * 1000; // 1 minute
    const isLimited = submissionRateLimiter.isRateLimited(key, cooldownPeriod);
    
    if (isLimited) {
      console.log(`Rate limiting submission for ${normalizedEmail}, too many requests`);
    } else {
      console.log(`Submission from ${normalizedEmail} is within rate limits`);
    }
    
    return isLimited;
  },
  
  // Create a new project from calculator submission
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    // Check rate limiting
    if (project.client_email) {
      const isLimited = this.isRateLimited(project.client_email);
      if (isLimited) {
        throw new Error('RATE_LIMITED');
      }
    }
    
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
      console.error('Error creating project:', error);
      throw error;
    }
    
    // Debug: Log the created project data from database
    console.log('Project created successfully:', data);
    
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
