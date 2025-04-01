
import { supabase, Settings } from '@/lib/supabase';

// Enhanced cache for settings to reduce database calls
let settingsCache: Settings | null = null;
let settingsCacheTimestamp: number = 0;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Default settings to use when database access fails
const DEFAULT_SETTINGS: Omit<Settings, 'id' | 'created_at' | 'updated_at'> = {
  plumbing_rate_per_sqft: 150,
  tile_cost_per_unit: 80,
  tiling_labor_per_sqft: 85,
  breakage_percentage: 10
};

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
        console.log('Database error while fetching settings:', error);
        // If no settings exist or permissions error, use default values
        const defaultSettings: Settings = {
          id: 'default',
          ...DEFAULT_SETTINGS,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Update cache with defaults
        settingsCache = defaultSettings;
        settingsCacheTimestamp = now;
        
        return defaultSettings;
      }
      
      // Update cache
      settingsCache = data as Settings;
      settingsCacheTimestamp = now;
      
      return data as Settings;
    } catch (error) {
      console.error('Error in getSettings:', error);
      
      // Provide default settings even on unexpected errors
      console.log('Using default settings after error');
      const defaultSettings: Settings = {
        id: 'default',
        ...DEFAULT_SETTINGS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return defaultSettings;
    }
  },
  
  // Create default settings if none exist
  async createDefaultSettings(): Promise<Settings> {
    try {
      const defaultSettings = {
        ...DEFAULT_SETTINGS
      };
      
      const { data, error } = await supabase
        .from('settings')
        .insert(defaultSettings)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating default settings:', error);
        
        // If permissions block this, return a mock result
        return {
          id: 'default',
          ...DEFAULT_SETTINGS,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      return data as Settings;
    } catch (error) {
      console.error('Error in createDefaultSettings:', error);
      
      // Return default settings even on error
      return {
        id: 'default',
        ...DEFAULT_SETTINGS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
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
        
        // If permissions block this, return current settings
        return current;
      }
      
      // Invalidate cache on update
      this.clearCache();
      
      return data as Settings;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      
      // Return current/default settings even on error
      const currentOrDefault = settingsCache || {
        id: 'default',
        ...DEFAULT_SETTINGS,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return currentOrDefault;
    }
  }
};
