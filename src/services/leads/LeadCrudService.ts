import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Lead, LeadFilter } from './types';
import { ActivityLogService } from './ActivityLogService';

export const LeadCrudService = {
  async getLeads(filters: LeadFilter = {}): Promise<{ data: Lead[], count: number }> {
    try {
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' });
      
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
      
      if (filters.sortBy) {
        const direction = filters.sortDirection || 'desc';
        query = query.order(filters.sortBy, { ascending: direction === 'asc' });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
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
      
      await ActivityLogService.addActivityLog(id, 'Lead Updated', `Updated: ${Object.keys(lead).join(', ')}`);
      
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

  async markLeadAsConverted(id: string, projectId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: 'Converted',
          remarks: `Converted to Project ${projectId} on ${new Date().toLocaleDateString()}`
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await ActivityLogService.addActivityLog(
        id, 
        'Lead Converted', 
        `Converted to Project ${projectId}`
      );
      
      return true;
    } catch (error: any) {
      console.error('Error marking lead as converted:', error);
      toast({
        title: "Failed to mark lead as converted",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }
};
