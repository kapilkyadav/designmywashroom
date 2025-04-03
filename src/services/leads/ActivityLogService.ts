
import { supabase } from '@/lib/supabase';
import { LeadActivityLog } from './types';

export const ActivityLogService = {
  async getLeadActivityLogs(leadId: string): Promise<LeadActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('lead_activity_logs')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as LeadActivityLog[];
    } catch (error) {
      console.error('Error fetching lead activity logs:', error);
      return [];
    }
  },
  
  async addActivityLog(leadId: string, action: string, details?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('lead_activity_logs')
        .insert({
          lead_id: leadId,
          action,
          details
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error adding activity log:', error);
      return false;
    }
  },
  
  async addLeadRemark(leadId: string, remark: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('lead_remarks_history')
        .insert({
          lead_id: leadId,
          remark
        });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error adding lead remark:', error);
      return false;
    }
  }
};
