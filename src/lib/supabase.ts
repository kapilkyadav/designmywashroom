
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Database types based on our schema
export type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
}

export type Brand = {
  id: string;
  name: string;
  description: string;
  product_count: number;
  sheet_url?: string;
  sheet_name?: string;
  header_row?: number;
  created_at: string;
  updated_at: string;
}

export type Product = {
  id: string;
  brand_id: string;
  name: string;
  description: string;
  category: string;
  mrp: number;
  landing_price: number;
  client_price: number;
  quotation_price: number;
  margin: number;
  extra_data?: any;
  created_at: string;
  updated_at: string;
}

export type Fixture = {
  id: string;
  name: string;
  category: 'electrical' | 'plumbing' | 'additional';
  mrp: number;
  landing_price: number;
  client_price: number;
  quotation_price: number;
  margin: number;
  created_at: string;
  updated_at: string;
}

export type Project = {
  id: string;
  client_name: string;
  client_email: string;
  client_mobile: string;
  client_location: string;
  project_type: 'new-construction' | 'renovation';
  length: number;
  width: number;
  height: number;
  selected_fixtures: any;
  selected_brand: string;
  timeline: 'standard' | 'flexible';
  fixture_cost: number;
  plumbing_cost: number;
  tiling_cost: number;
  final_estimate: number;
  created_at: string;
  updated_at: string;
}

// Settings for pricing calculations
export type Settings = {
  id: string;
  plumbing_rate_per_sqft: number;
  tile_cost_per_unit: number;
  tiling_labor_per_sqft: number;
  breakage_percentage: number;
  created_at: string;
  updated_at: string;
}
