
import { supabase, Settings } from '@/lib/supabase';

// Enhanced cache for settings to reduce database calls
let settingsCache: Settings | null = null;
let settingsCacheTimestamp: number = 0;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const SettingsService = {
  // Clear cache (useful after mutations)
  clearCache() {
    settingsCache = null;
    settingsCacheTimestamp = 0;
    console.log('Settings cache cleared');
  },
  
  // Get app settings (singleton record)
  async getSettings(): Promise<Settings> {
    try {
      // Check if we have a valid cache
      const now = Date.now();
      if (settingsCache && (now - settingsCacheTimestamp < CACHE_EXPIRY)) {
        console.log('Returning settings from cache');
        return settingsCache;
      }
      
      console.log('Fetching settings from database');
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        // If no settings exist, return default values
        if (error.code === 'PGRST116') {
          console.log('No settings found, creating defaults');
          const defaults = await this.createDefaultSettings();
          // Update cache
          settingsCache = defaults;
          settingsCacheTimestamp = now;
          return defaults;
        }
        console.error('Error fetching settings:', error);
        throw error;
      }
      
      // Update cache
      settingsCache = data as Settings;
      settingsCacheTimestamp = now;
      
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
      
      // Invalidate cache on update
      this.clearCache();
      
      return data as Settings;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      throw error;
    }
  }
};
