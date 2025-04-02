
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { SyncConfigService } from './SyncConfigService';

export const SyncOperationsService = {
  async syncLeads(): Promise<boolean> {
    try {
      console.log('Starting manual lead sync process');
      
      const configData = await SyncConfigService.getSyncConfig();
      if (!configData) {
        throw new Error('Sync configuration not found');
      }
      
      console.log('Using sync config:', {
        sheetName: configData.sheet_name,
        headerRow: configData.header_row
      });
      
      const response = await supabase.functions.invoke('fetch-leads', {
        body: {
          sheet_name: configData.sheet_name,
          header_row: configData.header_row
        }
      });
      
      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Error syncing leads');
      }
      
      if (!response.data) {
        console.error('Empty response from edge function');
        throw new Error('Empty response from edge function');
      }
      
      if (!response.data.success) {
        console.error('Sync unsuccessful:', response.data);
        throw new Error(response.data.error || 'Error syncing leads');
      }
      
      console.log('Sync completed successfully:', response.data);
      
      toast({
        title: "Leads synced successfully",
        description: `Added ${response.data.newLeadsAdded} new leads from Google Sheet.`,
      });
      
      return true;
    } catch (error: any) {
      console.error('Error syncing leads:', error);
      toast({
        title: "Failed to sync leads",
        description: error.message || 'An unknown error occurred',
        variant: "destructive",
      });
      return false;
    }
  },
  
  async scheduleSync(): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke('scheduled-leads-sync');
      
      if (response.error) {
        throw new Error(response.error.message || 'Error scheduling lead sync');
      }
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error scheduling lead sync');
      }
      
      return true;
    } catch (error: any) {
      console.error('Error scheduling lead sync:', error);
      return false;
    }
  }
};
