
import { supabase } from '@/lib/supabase';
import { LeadRemark } from './types';

export const LeadRemarksService = {
  async getRemarks(leadId: string): Promise<LeadRemark[]> {
    try {
      const { data, error } = await supabase
        .from('lead_remarks_history')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as LeadRemark[];
    } catch (error) {
      console.error('Error fetching lead remarks:', error);
      return [];
    }
  },
  
  async addRemark(leadId: string, remark: string): Promise<boolean> {
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
