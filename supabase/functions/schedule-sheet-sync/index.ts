
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  // Create Supabase client with service role key for admin access
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Parse the request
    const { brandId } = await req.json();
    
    if (!brandId) {
      throw new Error('Brand ID is required');
    }
    
    // Check if brand exists
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id, name, sheet_url, sheet_name')
      .eq('id', brandId)
      .single();
    
    if (brandError || !brand) {
      throw new Error('Brand not found');
    }
    
    // Validate brand has sheet information
    if (!brand.sheet_url || !brand.sheet_name) {
      throw new Error('Brand does not have sheet URL or sheet name configured');
    }
    
    // Check if a sync job already exists for this brand
    const { data: existingJob, error: jobError } = await supabase
      .from('scheduled_jobs')
      .select('*')
      .eq('brand_id', brandId)
      .eq('job_type', 'sheet_sync')
      .maybeSingle();
    
    if (jobError) {
      throw jobError;
    }
    
    // If job already exists, return it
    if (existingJob) {
      return new Response(
        JSON.stringify({
          message: 'Sync job already exists for this brand',
          jobId: existingJob.id,
          scheduled: true,
          existing: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a new scheduled job for daily sync at 10:00 AM
    const { data: job, error: createError } = await supabase
      .from('scheduled_jobs')
      .insert({
        brand_id: brandId,
        job_type: 'sheet_sync',
        schedule: '0 10 * * *', // Run at 10:00 AM every day
        status: 'active',
      })
      .select()
      .single();
    
    if (createError) {
      throw createError;
    }
    
    return new Response(
      JSON.stringify({
        message: `Daily sync scheduled for ${brand.name} at 10:00 AM`,
        jobId: job.id,
        scheduled: true,
        existing: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scheduling sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
