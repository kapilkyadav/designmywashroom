
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
    // Find jobs that are scheduled to run
    const { data: jobs, error: jobsError } = await supabase
      .from('scheduled_jobs')
      .select('id, brand_id, job_type, status, last_run')
      .eq('job_type', 'sheet_sync')
      .eq('status', 'active');
    
    if (jobsError) throw jobsError;
    
    const now = new Date();
    const results = [];
    
    // Use Promise.all for parallel processing of jobs
    const processingPromises = jobs.map(async (job) => {
      try {
        // Call the run-sheet-sync function for each job
        const syncResponse = await fetch(
          `${supabaseUrl}/functions/v1/run-sheet-sync`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ brandId: job.brand_id })
          }
        );
        
        if (!syncResponse.ok) {
          throw new Error(`Error syncing sheet: ${await syncResponse.text()}`);
        }
        
        const result = await syncResponse.json();
        
        // Update job's last_run timestamp
        await supabase
          .from('scheduled_jobs')
          .update({ last_run: now.toISOString() })
          .eq('id', job.id);
          
        return { ...result, success: true };
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        return {
          jobId: job.id,
          brandId: job.brand_id,
          error: error.message,
          success: false
        };
      }
    });
    
    // Wait for all jobs to complete
    const jobResults = await Promise.all(processingPromises);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        timestamp: now.toISOString(),
        jobsProcessed: jobs.length,
        results: jobResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error running scheduled sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
