
export interface ColumnMapping {
  lead_date: string;
  customer_name: string;
  email: string;
  phone: string;
  location: string;
  project_type: string;
  budget_preference: string;
  notes: string;
  [key: string]: string;
}

export interface LeadSyncConfigLocal {
  id?: string;
  sheet_url: string;
  sheet_name: string;
  header_row: number;
  sync_interval: number;
  interval_unit: 'minutes' | 'hours';
  auto_sync_enabled: boolean;
  column_mapping: ColumnMapping;
  last_synced_at: string | null;
}

export interface ServiceLeadSyncConfig {
  id?: string;
  sheet_url: string;
  sheet_name: string;
  header_row: number;
  column_mapping: Record<string, string>;
  sync_interval_minutes: number;
  last_sync_at: string | null;
  created_at?: string;
  updated_at?: string;
}
