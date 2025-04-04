
// Base interface for real projects
export interface RealProject {
  id: string;
  project_id: string;
  client_name: string;
  client_email?: string;
  client_mobile: string;
  client_location?: string;
  project_type: string;
  selected_brand?: string;
  project_details: {
    address?: string;
    floor_number?: string;
    service_lift_available?: boolean;
    [key: string]: any;
  };
  length?: number;
  width?: number;
  height?: number;
  status: string;
  internal_notes?: string;
  created_at: string;
  last_updated_at: string;
  converted_at: string;
  quotation_generated_at?: string;
  washrooms?: Washroom[];
  execution_costs?: Record<string, any>;
  vendor_rates?: Record<string, any>;
  additional_costs?: Record<string, any>;
  final_quotation_amount?: number;
  original_estimate?: number;
  // Methods added during extension
  updateCosts: (data: Partial<RealProject>) => Promise<boolean>;
}

// Filter options for fetching real projects
export interface RealProjectFilter {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// For conversion from leads or estimates
export interface ConvertibleRecord {
  record_type: 'lead' | 'project_estimate';
  record_id: string;
  client_name: string;
  client_email?: string;
  client_mobile: string;
  client_location?: string;
  created_date: string;
  status: string | null;
  real_project_id: string | null;
}

// Washroom details
export interface Washroom {
  id: string;
  project_id?: string;
  name: string;
  length: number;
  width: number;
  height: number;
  area: number;
  wall_area?: number;
  wallArea?: number; // For compatibility with form data
  ceiling_area?: number;
  ceilingArea?: number; // For compatibility with form data
  services?: Record<string, boolean>;
  selected_brand?: string; // New field for brand selection per washroom
  service_details?: Record<string, ServiceDetail>; // New field for service-specific details
  created_at?: string;
}

// Service detail information
export interface ServiceDetail {
  quantity?: number;
  length?: number;
  width?: number;
  height?: number;
  area?: number;
  notes?: string;
}

// Cost related interfaces
export interface ExecutionCost {
  id: string;
  service_id: string;
  service_name: string;
  quantity: number;
  rate: number;
  total: number;
  notes?: string;
}

export interface VendorRate {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  rate: number;
  total: number;
  washroom_id?: string;
  notes?: string;
}

export interface AdditionalCost {
  id: string;
  name: string;
  amount: number;
  description?: string;
}

export interface ProjectQuotation {
  id: string;
  project_id: string;
  quotation_number: string;
  quotation_data: Record<string, any>;
  quotation_html?: string;
  created_by?: string;
  created_at: string;
}
