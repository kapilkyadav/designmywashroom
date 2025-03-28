
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  lead_date: string;
  customer_name: string;
  phone: string;
  email: string | null;
  location: string | null;
  budget_preference: string | null;
  status: string;
  remarks: string | null;
  next_followup_date: string | null;
  created_at: string;
  updated_at: string;
  last_synced_at: string | null;
}

export interface LeadSyncConfig {
  id: string;
  sheet_url: string;
  sheet_name: string;
  header_row: number;
  column_mapping: Record<string, string>;
  sync_interval_minutes: number;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadFilter {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  budget?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface LeadActivityLog {
  id: string;
  lead_id: string;
  action: string;
  details: string | null;
  performed_by: string | null;
  created_at: string;
}

export const LeadService = {
  async getLeads(filters: LeadFilter = {}): Promise<{ data: Lead[], count: number }> {
    try {
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.dateFrom) {
        query = query.gte('lead_date', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('lead_date', filters.dateTo);
      }
      
      if (filters.budget) {
        query = query.eq('budget_preference', filters.budget);
      }
      
      if (filters.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }
      
      // Apply sorting
      if (filters.sortBy) {
        const direction = filters.sortDirection || 'desc';
        query = query.order(filters.sortBy, { ascending: direction === 'asc' });
      } else {
        // Default sort by created_at desc
        query = query.order('created_at', { ascending: false });
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 10;
      const start = (page - 1) * pageSize;
      
      query = query.range(start, start + pageSize - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return { 
        data: data as Lead[], 
        count: count || 0 
      };
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Failed to fetch leads",
        description: error.message,
        variant: "destructive",
      });
      return { data: [], count: 0 };
    }
  },
  
  async getLead(id: string): Promise<Lead | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Lead;
    } catch (error: any) {
      console.error('Error fetching lead:', error);
      toast({
        title: "Failed to fetch lead details",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  },
  
  async updateLead(id: string, lead: Partial<Lead>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leads')
        .update(lead)
        .eq('id', id);
      
      if (error) throw error;
      
      // Log activity
      await this.addActivityLog(id, 'Lead Updated', `Updated: ${Object.keys(lead).join(', ')}`);
      
      toast({
        title: "Lead updated",
        description: "The lead has been successfully updated.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating lead:', error);
      toast({
        title: "Failed to update lead",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  async deleteLead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Lead deleted",
        description: "The lead has been successfully deleted.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Failed to delete lead",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  async addActivityLog(leadId: string, action: string, details?: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getSession();
      const userId = userData.session?.user.id;
      
      const { error } = await supabase
        .from('lead_activity_logs')
        .insert({
          lead_id: leadId,
          action,
          details: details || null,
          performed_by: userId || null
        });
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error adding activity log:', error);
      return false;
    }
  },
  
  async getActivityLogs(leadId: string): Promise<LeadActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('lead_activity_logs')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as LeadActivityLog[];
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  },
  
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
      // Get current config
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
        // Update existing config
        const { error } = await supabase
          .from('lead_sync_config')
          .update(config)
          .eq('id', currentConfig.id);
        
        if (error) throw error;
        
        result = { success: true, id: currentConfig.id };
      } else {
        // Insert new config
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
  },
  
  async syncLeads(): Promise<boolean> {
    try {
      // Add log to help debug
      console.log('Starting manual lead sync process');
      
      // First, get the current sync config to send along with the request
      const configData = await this.getSyncConfig();
      if (!configData) {
        throw new Error('Sync configuration not found');
      }
      
      console.log('Using sync config:', {
        sheetName: configData.sheet_name,
        headerRow: configData.header_row
      });
      
      // Invoke the edge function with the config data included
      const response = await supabase.functions.invoke('fetch-leads', {
        body: {
          sheet_name: configData.sheet_name,
          header_row: configData.header_row
        }
      });
      
      // Check for edge function errors
      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Error syncing leads');
      }
      
      // Check for response data errors
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
