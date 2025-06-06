
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
    console.log('Starting scheduled leads sync check');
    
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
    
    console.log('Sync config found:', { 
      syncInterval: syncConfig.sync_interval_minutes,
      lastSync: syncConfig.last_sync_at,
      sheetUrl: syncConfig.sheet_url,
      sheetName: syncConfig.sheet_name || 'Sheet1'
    });
    
    // Check if it's time to sync based on interval
    const lastSync = syncConfig.last_sync_at ? new Date(syncConfig.last_sync_at) : new Date(0);
    const now = new Date();
    const minutesSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60);
    
    // If the time elapsed is less than the interval, skip sync
    if (minutesSinceLastSync < syncConfig.sync_interval_minutes) {
      // Calculate the remaining time before next sync
      const nextSyncMinutes = Math.ceil(syncConfig.sync_interval_minutes - minutesSinceLastSync);
      let nextSyncMessage;
      
      if (nextSyncMinutes >= 60 && nextSyncMinutes % 60 === 0) {
        // Display in hours if it's an exact number of hours
        const nextSyncHours = nextSyncMinutes / 60;
        nextSyncMessage = `Next sync scheduled in ${nextSyncHours} ${nextSyncHours === 1 ? 'hour' : 'hours'}`;
      } else {
        nextSyncMessage = `Next sync scheduled in ${nextSyncMinutes} ${nextSyncMinutes === 1 ? 'minute' : 'minutes'}`;
      }
      
      console.log(nextSyncMessage);
      
      return new Response(
        JSON.stringify({
          success: true,
          synced: false,
          message: nextSyncMessage
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Calling fetch-leads function to perform sync');
    
    // Call the fetch-leads function to perform the sync with the sheet parameters
    const syncResponse = await fetch(
      `${supabaseUrl}/functions/v1/fetch-leads`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        // Include sheet name and header row information in the request
        body: JSON.stringify({
          sheet_name: syncConfig.sheet_name || 'Sheet1',
          header_row: syncConfig.header_row || 1
        })
      }
    );
    
    if (!syncResponse.ok) {
      const errorText = await syncResponse.text();
      console.error(`Error syncing leads (${syncResponse.status}): ${errorText}`);
      throw new Error(`Error syncing leads: ${errorText}`);
    }
    
    const result = await syncResponse.json();
    
    if (!result.success) {
      throw new Error(`Sync failed: ${result.error || 'Unknown error'}`);
    }
    
    console.log('Sync completed successfully:', result);
    
    // Update the last sync timestamp
    await supabase
      .from('lead_sync_config')
      .update({ last_sync_at: now.toISOString() })
      .eq('id', syncConfig.id);
    
    return new Response(
      JSON.stringify({
        success: true,
        synced: true,
        result,
        nextSync: new Date(now.getTime() + (syncConfig.sync_interval_minutes * 60 * 1000)).toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in scheduled sync:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
