
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
  
  try {
    // Parse the request
    const { sheetUrl, sheetName, headerRowIndex } = await req.json();
    
    // Validate input
    if (!sheetUrl) {
      return new Response(
        JSON.stringify({ error: 'Sheet URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      return new Response(
        JSON.stringify({ error: 'Invalid Google Sheet URL' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Determine which Google API endpoint to use
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName || 'Sheet1')}?key=${Deno.env.get('GOOGLE_API_KEY')}`;
    
    // Fetch data from Google Sheets API
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error('Google Sheets API error:', await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sheet data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const sheetData = await response.json();
    
    // Get headers and data rows
    const headerRow = headerRowIndex || 0;
    const headers = sheetData.values[headerRow] || [];
    
    // Extract data rows after the header
    const rows = sheetData.values.slice(headerRow + 1).map((row: any[]) => {
      // Map each row to an object using the headers
      const obj: Record<string, any> = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    return new Response(
      JSON.stringify({ headers, data: rows }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
