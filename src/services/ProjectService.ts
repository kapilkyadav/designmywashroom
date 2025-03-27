
import { supabase, Project } from '@/lib/supabase';

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
  
  // Create a new project from calculator submission
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
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
