
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to extract sheet ID from Google Sheet URL
function extractSheetId(url: string): string | null {
  // Extract the sheet ID from a Google Sheets URL
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const googleApiKey = Deno.env.get('GOOGLE_API_KEY') || '';
  
  // Create Supabase client with service role key for admin access
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Parse the request
    const { brandId } = await req.json();
    
    // If a specific brand ID is not provided, process all scheduled jobs
    if (!brandId) {
      // Get all active scheduled sync jobs
      const { data: jobs, error: jobsError } = await supabase
        .from('scheduled_jobs')
        .select('*')
        .eq('job_type', 'sheet_sync')
        .eq('status', 'active');
      
      if (jobsError) throw jobsError;
      
      // Process each job
      const results = await Promise.all(
        jobs.map(async (job) => {
          try {
            return await processSheet(job.brand_id, supabase, googleApiKey);
          } catch (error) {
            console.error(`Error processing brand ${job.brand_id}:`, error);
            return { brandId: job.brand_id, success: false, error: error.message };
          }
        })
      );
      
      // Update last_run timestamp for all jobs
      await supabase
        .from('scheduled_jobs')
        .update({ last_run: new Date().toISOString() })
        .eq('job_type', 'sheet_sync')
        .eq('status', 'active');
      
      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Process a specific brand
      const result = await processSheet(brandId, supabase, googleApiKey);
      
      // Update the last_run timestamp for this job
      await supabase
        .from('scheduled_jobs')
        .update({ last_run: new Date().toISOString() })
        .eq('brand_id', brandId)
        .eq('job_type', 'sheet_sync');
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error running sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function processSheet(brandId: string, supabase: any, googleApiKey: string) {
  // Get brand information
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();
  
  if (brandError) throw brandError;
  
  // Validate brand has sheet information
  if (!brand.sheet_url || !brand.sheet_name) {
    throw new Error(`Brand ${brand.name} does not have sheet information`);
  }
  
  // Extract sheet ID
  const sheetId = extractSheetId(brand.sheet_url);
  if (!sheetId) {
    throw new Error(`Invalid sheet URL for brand ${brand.name}`);
  }
  
  // Fetch sheet data
  const headerRow = brand.header_row || 0;
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(brand.sheet_name)}?key=${googleApiKey}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Google Sheets API error: ${await response.text()}`);
  }
  
  const sheetData = await response.json();
  
  // Process the data
  const headers = sheetData.values[headerRow] || [];
  const rows = sheetData.values.slice(headerRow + 1).map((row: any[]) => {
    const obj: Record<string, any> = {};
    headers.forEach((header: string, index: number) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
  
  // Map sheet data to product structure
  // We're assuming columns match directly for simplicity
  // In a real app, you would need proper mapping
  const products = rows
    .filter((row: any) => row.name) // Filter out rows without names
    .map((row: any) => {
      const landingPrice = parseFloat(row.landing_price) || 0;
      const quotationPrice = parseFloat(row.quotation_price) || 0;
      
      // Calculate margin
      const margin = landingPrice > 0 
        ? ((quotationPrice - landingPrice) / landingPrice) * 100 
        : 0;
      
      // Create product object
      return {
        brand_id: brandId,
        name: row.name || '',
        description: row.description || '',
        category: row.category || '',
        mrp: parseFloat(row.mrp) || 0,
        landing_price: landingPrice,
        client_price: parseFloat(row.client_price) || 0,
        quotation_price: quotationPrice,
        margin: parseFloat(margin.toFixed(2)),
        extra_data: {} // Any extra data could be stored here
      };
    });
  
  // First, get existing products for this brand
  const { data: existingProducts, error: productsError } = await supabase
    .from('products')
    .select('id, name')
    .eq('brand_id', brandId);
  
  if (productsError) throw productsError;
  
  // Create a map of product names to IDs
  const productMap = new Map();
  existingProducts.forEach((product: any) => {
    productMap.set(product.name.toLowerCase(), product.id);
  });
  
  // Split products into updates and inserts
  const updates = [];
  const inserts = [];
  
  products.forEach(product => {
    const existingId = productMap.get(product.name.toLowerCase());
    if (existingId) {
      updates.push({
        id: existingId,
        ...product
      });
    } else {
      inserts.push(product);
    }
  });
  
  // Perform upserts in batches if needed
  let inserted = 0;
  let updated = 0;
  
  // Insert new products
  if (inserts.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .insert(inserts)
      .select('id');
    
    if (error) throw error;
    inserted = data.length;
  }
  
  // Update existing products
  if (updates.length > 0) {
    for (const product of updates) {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', product.id);
      
      if (error) throw error;
      updated++;
    }
  }
  
  // Update brand's product count
  const { count, error: countError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('brand_id', brandId);
  
  if (countError) throw countError;
  
  // Update brand record with new product count
  await supabase
    .from('brands')
    .update({ 
      product_count: count || 0,
      updated_at: new Date().toISOString()
    })
    .eq('id', brandId);
  
  return {
    brandId,
    brandName: brand.name,
    success: true,
    productsProcessed: products.length,
    productsInserted: inserted,
    productsUpdated: updated,
    totalProducts: count
  };
}
