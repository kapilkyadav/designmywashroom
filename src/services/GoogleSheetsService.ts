
import { supabase } from '@/lib/supabase';

export interface SheetColumn {
  header: string;
  field: string;
}

export interface SheetMapping {
  name: string;
  description: string;
  category: string;
  mrp: string;
  landing_price: string;
  client_price: string;
  quotation_price: string;
}

export const GoogleSheetsService = {
  // Fetch data from a Google Sheet with timeout
  async fetchSheetData(
    sheetUrl: string,
    sheetName: string,
    headerRowIndex: number,
    timeoutMs = 15000 // 15 seconds default timeout
  ): Promise<{ headers: string[]; data: any[] }> {
    try {
      // Create an AbortController for the timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      // Use Supabase Edge Function to fetch sheet data with signal
      const { data, error } = await supabase.functions.invoke('fetch-sheet-data', {
        body: {
          sheetUrl,
          sheetName,
          headerRowIndex
        },
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Error fetching sheet data:', error);
        throw error;
      }
      
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Sheet validation request timed out');
        throw new Error('Sheet validation timed out. Please try again or check your sheet URL and permissions.');
      }
      console.error('Error in fetchSheetData:', error);
      throw error;
    }
  },
  
  // Validate sheet connection (lighter version just to check if sheet exists)
  async validateSheet(
    sheetUrl: string,
    sheetName: string,
    headerRowIndex: number
  ): Promise<boolean> {
    try {
      // Create a lighter request to just validate sheet connection
      const { data, error } = await supabase.functions.invoke('validate-sheet', {
        body: {
          sheetUrl,
          sheetName,
          headerRowIndex
        }
      });
      
      if (error) {
        console.error('Error validating sheet:', error);
        throw error;
      }
      
      return data.valid === true;
    } catch (error) {
      console.error('Error in validateSheet:', error);
      throw error;
    }
  },
  
  // Map sheet data to product data structure
  mapSheetDataToProducts(
    data: any[],
    headers: string[],
    mapping: SheetMapping,
    brandId: string
  ) {
    try {
      const products = data.map(row => {
        // Skip rows with no name
        if (!row[mapping.name]) {
          return null;
        }
        
        const landingPrice = parseFloat(row[mapping.landing_price]) || 0;
        const quotationPrice = parseFloat(row[mapping.quotation_price]) || 0;
        
        // Calculate margin if both prices are available
        const margin = landingPrice > 0 
          ? ((quotationPrice - landingPrice) / landingPrice) * 100 
          : 0;
        
        // Create a product object
        const product = {
          brand_id: brandId,
          name: row[mapping.name] || '',
          description: row[mapping.description] || '',
          category: row[mapping.category] || '',
          mrp: parseFloat(row[mapping.mrp]) || 0,
          landing_price: landingPrice,
          client_price: parseFloat(row[mapping.client_price]) || 0,
          quotation_price: quotationPrice,
          margin: parseFloat(margin.toFixed(2)),
          
          // Store any unmapped data as extra_data
          extra_data: {}
        };
        
        // Add all unmapped columns to extra_data
        headers.forEach((header, index) => {
          if (!Object.values(mapping).includes(header)) {
            product.extra_data[header] = row[header];
          }
        });
        
        return product;
      }).filter(Boolean); // Remove any null products
      
      return products;
    } catch (error) {
      console.error('Error mapping sheet data:', error);
      throw error;
    }
  },
  
  // Schedule automatic sync for brand products
  async scheduleSync(brandId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('schedule-sheet-sync', {
        body: { brandId }
      });
      
      if (error) {
        console.error('Error scheduling sync:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in scheduleSync:', error);
      throw error;
    }
  }
};
