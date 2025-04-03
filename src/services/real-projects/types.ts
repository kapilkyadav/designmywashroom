
// Export types for real project related operations
export interface RealProject {
  id: string;
  project_id: string;
  client_name: string;
  client_email?: string;
  client_mobile: string;
  client_location?: string;
  project_type: string;
  selected_brand?: string;
  created_at: string;
  status: string;
  internal_notes?: string;
  last_updated_at: string;
  quotation_generated_at?: string;
  converted_at: string;
  final_quotation_amount?: number;
  additional_costs?: Record<string, any>;
  vendor_rates?: Record<string, any>;
  execution_costs?: Record<string, any>;
  original_estimate?: number;
  selected_fixtures?: Record<string, any>;
  height?: number;
  width?: number;
  length?: number;
  project_details: Record<string, any>;
  project_estimate_id?: string;
  lead_id?: string;
  washroom_count?: number;
  
  // Methods that will be added during extension
  updateCosts?: (costData: any) => Promise<RealProject>;
}

export interface RealProjectFilter {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ConvertibleRecord {
  record_type: 'lead' | 'project_estimate';
  record_id: string;
  client_name: string;
  client_email?: string;
  client_mobile?: string;
  client_location?: string;
  created_date: string;
  status?: string;
  real_project_id?: string | null;
}

export interface ProjectQuotation {
  id: string;
  project_id: string;
  quotation_number: string;
  quotation_data: Record<string, any>;
  quotation_html?: string;
  created_at: string;
  created_by?: string;
}

export interface Washroom {
  id: string;
  project_id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  area?: number;
  wall_area?: number;
  ceiling_area?: number;
  services?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}
