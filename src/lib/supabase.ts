
import { createClient } from '@supabase/supabase-js';

// Define default values for development if env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://afbmlkeplnimkfltwchy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYm1sa2VwbG5pbWtmbHR3Y2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjU1NjIsImV4cCI6MjA1ODY0MTU2Mn0.NsaKmqtoy3LB9xEK5nnhCoaq7IxM5NbbGrRi-roMu8U';

// Check if we have the required values and log a message if they're being used from defaults
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Using default Supabase credentials. For production, set your own VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Performance optimization: Configure with proper caching options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    fetch: (...args) => fetch(...args)
  },
  db: {
    schema: 'public'
  }
});

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
