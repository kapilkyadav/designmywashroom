
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to extract sheet ID from Google Sheet URL - optimized regex
function extractSheetId(url: string): string | null {
  // Extract the sheet ID from a Google Sheets URL - more efficient regex
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

// Set a shorter timeout for API requests for better performance
const FETCH_TIMEOUT = 6000; // 6 seconds (reduced)

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
    
    // Use Promise.race for timeout handling
    const fetchWithTimeout = async (url: string) => {
      const response = await Promise.race([
        fetch(url),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), FETCH_TIMEOUT)
        ) as Promise<Response>
      ]);
      return response;
    };
    
    try {
      // Determine which Google API endpoint to use - add fields parameter to limit response size
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName || 'Sheet1')}?key=${Deno.env.get('GOOGLE_API_KEY')}&valueRenderOption=UNFORMATTED_VALUE`;
      
      // Fetch data from Google Sheets API with timeout
      const response = await fetchWithTimeout(apiUrl);
      
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
      
      // Extract data rows after the header - optimize object creation
      const rows = sheetData.values.slice(headerRow + 1).map((row: any[]) => {
        // Map each row to an object using the headers - more efficient implementation
        const obj: Record<string, any> = {};
        for (let i = 0; i < headers.length; i++) {
          if (headers[i]) { // Only add properties for headers that exist
            obj[headers[i]] = row[i] !== undefined ? row[i] : '';
          }
        }
        return obj;
      });
      
      return new Response(
        JSON.stringify({ headers, data: rows }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError: any) {
      if (fetchError.message === 'Request timeout') {
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
