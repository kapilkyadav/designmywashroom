
import { Json } from '@/integrations/supabase/types';

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

export interface LeadRemark {
  id: string;
  lead_id: string;
  remark: string;
  created_at: string;
  created_by: string | null;
}
