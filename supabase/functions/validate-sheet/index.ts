
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
  
  try {
    // Parse the request
    const { sheetUrl, sheetName } = await req.json();
    
    // Validate input
    if (!sheetUrl) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Sheet URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid Google Sheet URL' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Use a lightweight check that just verifies the sheet exists
    // This is faster than fetching all the data
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${Deno.env.get('GOOGLE_API_KEY')}`;
    
    const response = await fetch(metadataUrl);
    
    if (!response.ok) {
      console.error('Google Sheets API error:', await response.text());
      return new Response(
        JSON.stringify({ valid: false, error: 'Failed to access sheet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const metadata = await response.json();
    
    // Check if the named sheet exists
    if (sheetName) {
      const sheetExists = metadata.sheets.some(
        (sheet: any) => sheet.properties.title === sheetName
      );
      
      if (!sheetExists) {
        return new Response(
          JSON.stringify({ valid: false, error: `Sheet "${sheetName}" not found` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ valid: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error validating sheet:', error);
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
