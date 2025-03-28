
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
    // Get the sync configuration
    const { data: syncConfig, error: syncError } = await supabase
      .from('lead_sync_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (syncError || !syncConfig) {
      throw new Error('Sync configuration not found');
    }
    
    // Check if it's time to sync based on interval
    const lastSync = syncConfig.last_sync_at ? new Date(syncConfig.last_sync_at) : new Date(0);
    const now = new Date();
    const minutesSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60);
    
    // If the time elapsed is less than the interval, skip sync
    if (minutesSinceLastSync < syncConfig.sync_interval_minutes) {
      return new Response(
        JSON.stringify({
          success: true,
          synced: false,
          message: `Next sync scheduled in ${Math.ceil(syncConfig.sync_interval_minutes - minutesSinceLastSync)} minutes`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Call the fetch-leads function to perform the sync
    const syncResponse = await fetch(
      `${supabaseUrl}/functions/v1/fetch-leads`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      }
    );
    
    if (!syncResponse.ok) {
      throw new Error(`Error syncing leads: ${await syncResponse.text()}`);
    }
    
    const result = await syncResponse.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        synced: true,
        result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in scheduled sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
