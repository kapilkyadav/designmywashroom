
import { supabase, Settings } from '@/lib/supabase';

export const SettingsService = {
  // Get app settings (singleton record)
  async getSettings(): Promise<Settings> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        // If no settings exist, return default values
        if (error.code === 'PGRST116') {
          return this.createDefaultSettings();
        }
        console.error('Error fetching settings:', error);
        throw error;
      }
      
      return data as Settings;
    } catch (error) {
      console.error('Error in getSettings:', error);
      throw error;
    }
  },
  
  // Create default settings if none exist
  async createDefaultSettings(): Promise<Settings> {
    try {
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
    } catch (error) {
      console.error('Error in createDefaultSettings:', error);
      throw error;
    }
  },
  
  // Update settings
  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    try {
      // First get current settings
      const current = await this.getSettings();
      
      const { data, error } = await supabase
        .from('settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', current.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating settings:', error);
        throw error;
      }
      
      return data as Settings;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      throw error;
    }
  }
};
