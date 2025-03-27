
import { supabase, Settings } from '@/lib/supabase';

export const SettingsService = {
  // Get settings (there should be only one record)
  async getSettings(): Promise<Settings> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      // If no settings found, create default settings
      if (error.code === 'PGRST116') {
        return this.createDefaultSettings();
      }
      
      console.error('Error fetching settings:', error);
      throw error;
    }
    
    return data as Settings;
  },
  
  // Create default settings
  async createDefaultSettings(): Promise<Settings> {
    const defaultSettings = {
      plumbing_rate_per_sqft: 150,
      tile_cost_per_unit: 80,
      tiling_labor_per_sqft: 85,
      breakage_percentage: 10
    };
    
    const { data, error } = await supabase
      .from('settings')
      .insert(defaultSettings)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating default settings:', error);
      throw error;
    }
    
    return data as Settings;
  },
  
  // Update settings
  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    // Get current settings first
    const currentSettings = await this.getSettings();
    
    const { data, error } = await supabase
      .from('settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentSettings.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
    
    return data as Settings;
  }
};
