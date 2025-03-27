
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
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Parse the request
    const { brandId } = await req.json();
    
    // Validate input
    if (!brandId) {
      return new Response(
        JSON.stringify({ error: 'Brand ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if a scheduled job already exists for this brand
    const { data: existingJobs, error: jobFetchError } = await supabase
      .from('scheduled_jobs')
      .select('*')
      .eq('brand_id', brandId)
      .eq('job_type', 'sheet_sync');
    
    if (jobFetchError) {
      console.error('Error fetching existing jobs:', jobFetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing scheduled jobs' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // If job exists, update it, otherwise create a new one
    let result;
    if (existingJobs && existingJobs.length > 0) {
      // Update existing job
      const { data, error } = await supabase
        .from('scheduled_jobs')
        .update({
          last_updated: new Date().toISOString(),
          status: 'active'
        })
        .eq('id', existingJobs[0].id)
        .select();
      
      if (error) throw error;
      result = { ...data[0], message: 'Sync schedule updated' };
    } else {
      // Create a new scheduled job
      const { data, error } = await supabase
        .from('scheduled_jobs')
        .insert({
          brand_id: brandId,
          job_type: 'sheet_sync',
          schedule: '0 10 * * *', // Run daily at 10 AM
          status: 'active',
          last_run: null
        })
        .select();
      
      if (error) throw error;
      result = { ...data[0], message: 'Sync scheduled successfully' };
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error scheduling sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
