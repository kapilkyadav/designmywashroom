
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { LeadSyncConfig } from './types';

export const SyncConfigService = {
  async getSyncConfig(): Promise<LeadSyncConfig | null> {
    try {
      const { data, error } = await supabase
        .from('lead_sync_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      
      return data as LeadSyncConfig;
    } catch (error: any) {
      console.error('Error fetching sync config:', error);
      return null;
    }
  },
  
  async updateSyncConfig(config: Partial<LeadSyncConfig>): Promise<boolean> {
    try {
      const { data: currentConfig, error: fetchError } = await supabase
        .from('lead_sync_config')
        .select('id')
        .limit(1)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let result;
      
      if (currentConfig) {
        const { error } = await supabase
          .from('lead_sync_config')
          .update(config)
          .eq('id', currentConfig.id);
        
        if (error) throw error;
        
        result = { success: true, id: currentConfig.id };
      } else {
        const { data, error } = await supabase
          .from('lead_sync_config')
          .insert(config)
          .select('id')
          .single();
        
        if (error) throw error;
        
        result = { success: true, id: data.id };
      }
      
      toast({
        title: "Sync configuration updated",
        description: "The Google Sheet configuration has been saved.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating sync config:', error);
      toast({
        title: "Failed to update sync configuration",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }
};
