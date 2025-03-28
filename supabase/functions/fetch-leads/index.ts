
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

// Process date string into a valid date format
function processDate(dateString: string): string {
  try {
    // Try to parse as ISO date first
    const date = new Date(dateString);
    
    // Check if valid date
    if (isNaN(date.getTime())) {
      // Try DD/MM/YYYY format
      const parts = dateString.split(/[\/\-\.]/);
      if (parts.length === 3) {
        // Assume DD/MM/YYYY if parts are < 4 digits
        if (parts[2].length === 4 && parts[0].length <= 2 && parts[1].length <= 2) {
          const newDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (!isNaN(newDate.getTime())) {
            return newDate.toISOString();
          }
        }
        // Assume MM/DD/YYYY
        const newDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
        if (!isNaN(newDate.getTime())) {
          return newDate.toISOString();
        }
      }
      // Default to today if parsing fails
      return new Date().toISOString();
    }
    
    return date.toISOString();
  } catch (error) {
    console.error("Error parsing date:", error);
    return new Date().toISOString();
  }
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
    // Get sync configuration
    const { data: syncConfig, error: syncError } = await supabase
      .from('lead_sync_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (syncError || !syncConfig) {
      throw new Error('Sync configuration not found');
    }

    console.log('Sync config retrieved:', {
      sheetUrl: syncConfig.sheet_url,
      sheetName: syncConfig.sheet_name || 'Sheet1',
      headerRow: syncConfig.header_row || 1
    });
    
    // Extract sheet ID
    const sheetId = extractSheetId(syncConfig.sheet_url);
    if (!sheetId) {
      throw new Error('Invalid sheet URL in configuration');
    }
    
    // Make sure we have a valid sheet name (fallback to Sheet1 if not provided)
    const sheetName = syncConfig.sheet_name || 'Sheet1';
    const headerRow = syncConfig.header_row || 1;
    
    // Properly construct and encode the API URL using spreadsheets.values.get endpoint
    // Use A1 notation for the range (e.g., "Sheet1!A1:Z1000") to explicitly specify the sheet
    const range = `${encodeURIComponent(sheetName)}!A1:Z1000`;
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${googleApiKey}`;
    
    console.log(`Fetching sheet data from: ${apiUrl.replace(googleApiKey, 'API_KEY_REDACTED')}`);
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Sheets API error (${response.status}): ${errorText}`);
      throw new Error(`Google Sheets API error: ${errorText}`);
    }
    
    const sheetData = await response.json();
    
    // Validate that we have values in the response
    if (!sheetData.values || !Array.isArray(sheetData.values) || sheetData.values.length === 0) {
      throw new Error('No data found in sheet');
    }

    console.log(`Sheet data retrieved, rows count: ${sheetData.values.length}`);
    
    // Process the data
    const headerIndex = headerRow - 1;
    if (headerIndex >= sheetData.values.length) {
      throw new Error(`Header row index (${headerRow}) is greater than available rows (${sheetData.values.length})`);
    }
    
    const headers = sheetData.values[headerIndex] || [];
    const rows = sheetData.values.slice(headerIndex + 1).map((row: any[]) => {
      const obj: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = index < row.length ? row[index] : '';
      });
      return obj;
    });
    
    // Get column mapping from configuration
    const columnMapping = syncConfig.column_mapping || {};

    console.log('Column mapping:', columnMapping);
    
    // Map sheet data to lead structure
    const leads = rows
      .filter((row: any) => columnMapping.customer_name && row[columnMapping.customer_name]) // Filter out rows with no names
      .map((row: any) => {
        // Create lead object with mapped fields
        const lead = {
          lead_date: columnMapping.lead_date ? processDate(row[columnMapping.lead_date]) : new Date().toISOString(),
          customer_name: columnMapping.customer_name ? row[columnMapping.customer_name] : 'Unknown',
          phone: columnMapping.phone ? row[columnMapping.phone] : '',
          email: columnMapping.email ? row[columnMapping.email] : null,
          location: columnMapping.location ? row[columnMapping.location] : null,
          project_type: columnMapping.project_type ? row[columnMapping.project_type] : null,
          budget_preference: columnMapping.budget_preference ? row[columnMapping.budget_preference] : null,
          notes: columnMapping.notes ? row[columnMapping.notes] : null,
          status: 'New', // Default status for new leads
          last_synced_at: new Date().toISOString()
        };
        
        console.log(`Mapped lead: ${lead.customer_name}, Phone: ${lead.phone}`);
        return lead;
      });

    // Get existing leads to avoid duplicates
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('phone');
    
    const existingPhones = new Set(existingLeads?.map((lead: any) => lead.phone));
    
    // Filter out leads that already exist
    const newLeads = leads.filter((lead: any) => lead.phone && !existingPhones.has(lead.phone));
    
    console.log(`Total leads found: ${leads.length}, New leads to add: ${newLeads.length}`);
    
    // Insert new leads
    let insertResult;
    if (newLeads.length > 0) {
      const { data, error } = await supabase
        .from('leads')
        .insert(newLeads)
        .select('id');
      
      if (error) {
        console.error('Error inserting leads:', error);
        throw error;
      }
      
      insertResult = data;
      
      // Log activities for new leads
      const activities = insertResult.map((lead: any) => ({
        lead_id: lead.id,
        action: 'Lead Created',
        details: 'Lead imported from Google Sheet'
      }));
      
      if (activities.length > 0) {
        await supabase.from('lead_activity_logs').insert(activities);
      }
    }
    
    // Update sync configuration
    await supabase
      .from('lead_sync_config')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', syncConfig.id);
    
    return new Response(
      JSON.stringify({
        success: true,
        totalLeads: leads.length,
        newLeadsAdded: newLeads.length,
        syncedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error fetching leads:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
