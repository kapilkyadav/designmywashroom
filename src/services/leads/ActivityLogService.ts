
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { LeadActivityLog, LeadRemark } from './types';

export const ActivityLogService = {
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
  
  async addRemark(leadId: string, remark: string): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getSession();
      const userId = userData.session?.user.id;
      
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          remarks: remark,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId);
      
      if (updateError) {
        console.error('Error updating lead remarks:', updateError);
        toast({
          title: "Failed to add remark",
          description: updateError.message,
          variant: "destructive",
        });
        return false;
      }
      
      await this.addActivityLog(leadId, 'Remark Added', remark);
      
      toast({
        title: "Remark added",
        description: "The remark has been added to the lead.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error adding remark:', error);
      toast({
        title: "Failed to add remark",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  async getRemarks(leadId: string): Promise<LeadRemark[]> {
    try {
      const { data, error } = await supabase
        .from('lead_activity_logs')
        .select('*')
        .eq('lead_id', leadId)
        .eq('action', 'Remark Added')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(log => ({
        id: log.id,
        lead_id: log.lead_id,
        remark: log.details || '',
        created_at: log.created_at,
        created_by: log.performed_by
      })) as LeadRemark[];
    } catch (error: any) {
      console.error('Error fetching remarks:', error);
      return [];
    }
  }
};
