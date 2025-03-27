
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
    
    // Define a controller for timeout handling
    const controller = new AbortController();
    // 10 second timeout for the Google Sheets API request
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      // Determine which Google API endpoint to use
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName || 'Sheet1')}?key=${Deno.env.get('GOOGLE_API_KEY')}`;
      
      // Fetch data from Google Sheets API with timeout
      const response = await fetch(apiUrl, {
        signal: controller.signal
      });
      
      // Clear the timeout as the request completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Sheets API error:', errorText);
        return new Response(
          JSON.stringify({ error: `Failed to fetch sheet data: ${response.status} ${errorText}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
        );
      }
      
      const sheetData = await response.json();
      
      // Validate that we have values
      if (!sheetData.values || !Array.isArray(sheetData.values) || sheetData.values.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Sheet contains no data' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Validate the header row exists
      const headerRow = headerRowIndex || 0;
      if (headerRow >= sheetData.values.length) {
        return new Response(
          JSON.stringify({ error: `Header row ${headerRow + 1} does not exist in the sheet` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      const headers = sheetData.values[headerRow] || [];
      
      // Check if we have data rows
      if (sheetData.values.length <= headerRow + 1) {
        return new Response(
          JSON.stringify({ headers, data: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
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
    } catch (fetchError: any) {
      // Clear the timeout if there was an error
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Request timed out fetching sheet data' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 408 }
        );
      }
      
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
