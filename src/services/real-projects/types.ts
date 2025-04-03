
import { User } from "@/lib/supabase";

// Real Project Types
export interface RealProject {
  id: string;
  project_id: string;
  lead_id: string | null;
  project_estimate_id: string | null;
  client_name: string;
  client_email: string | null;
  client_mobile: string;
  client_location: string | null;
  project_type: string;
  project_details: Record<string, any>;
  selected_brand: string | null;
  length: number | null;
  width: number | null;
  height: number | null;
  selected_fixtures: Record<string, any> | null;
  original_estimate: number | null;
  execution_costs: Record<string, any>;
  vendor_rates: Record<string, any>;
  additional_costs: Record<string, any>;
  final_quotation_amount: number | null;
  status: string;
  internal_notes: string | null;
  converted_at: string;
  quotation_generated_at: string | null;
  last_updated_at: string;
  created_at: string;
  washrooms: Washroom[];

  // Add a helper method to update costs more cleanly
  updateCosts: (data: {
    execution_costs: Record<string, any>;
    vendor_rates: Record<string, any>;
    additional_costs: Record<string, any>;
    washrooms: Washroom[];
    final_quotation_amount: number;
  }) => Promise<boolean>;
}

export interface Washroom {
  id?: string;
  name: string;
  length: number;
  width: number;
  height: number;
  area: number;
  wall_area?: number;
  ceiling_area?: number;
  services: Record<string, boolean>;
  project_id?: string;
}

export interface RealProjectFilter {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ConvertibleRecord {
  record_type: 'lead' | 'estimate' | 'project_estimate' | 'direct';
  record_id: string;
  client_name: string;
  client_email: string | null;
  client_mobile: string | null;
  client_location: string | null;
  created_date: string;
  status: string | null;
  real_project_id: string | null;
}

export interface ProjectQuotation {
  id: string;
  project_id: string;
  quotation_number: string;
  quotation_data: Record<string, any>;
  quotation_html: string | null;
  created_by: string | null;
  created_at: string;
}
