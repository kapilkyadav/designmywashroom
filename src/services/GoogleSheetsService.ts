
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
    timeoutMs = 12000 // 12 seconds default timeout (reduced)
  ): Promise<{ headers: string[]; data: any[] }> {
    try {
      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new Error('Sheet validation timed out'));
        }, timeoutMs);
      });
      
      // Create the actual fetch promise with optimized options
      const fetchPromise = supabase.functions.invoke('fetch-sheet-data', {
        body: {
          sheetUrl,
          sheetName,
          headerRowIndex
        }
      });
      
      // Race the fetch against the timeout
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      // If we get here, fetchPromise won the race
      const { data, error } = result as { data: any, error: any };
      
      if (error) {
        console.error('Error fetching sheet data:', error);
        throw error;
      }
      
      // Filter out empty headers
      if (data && data.headers) {
        data.headers = data.headers.filter((header: string) => 
          header && header.trim() !== ''
        );
      }
      
      return data;
    } catch (error: any) {
      if (error.message === 'Sheet validation timed out') {
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
  
  // Map sheet data to product data structure with optimized processing
  mapSheetDataToProducts(
    data: any[],
    headers: string[],
    mapping: SheetMapping,
    brandId: string
  ) {
    try {
      // Skip processing if no data or empty mapping
      if (!data || data.length === 0 || !mapping) {
        console.warn('No data or mapping provided for product mapping');
        return [];
      }
      
      // Filter out empty headers
      const validHeaders = headers.filter(header => header && header.trim() !== '');
      
      // Create a Set of mapped fields for faster lookup
      const mappedFields = new Set(Object.values(mapping).filter(Boolean));
      
      const products = data
        .filter(row => mapping.name && row[mapping.name]) // Filter out rows with no name
        .map(row => {
          const landingPrice = mapping.landing_price ? 
            (parseFloat(row[mapping.landing_price]) || 0) : 0;
            
          const quotationPrice = mapping.quotation_price ? 
            (parseFloat(row[mapping.quotation_price]) || 0) : 0;
          
          // Calculate margin if both prices are available
          const margin = landingPrice > 0 
            ? ((quotationPrice - landingPrice) / landingPrice) * 100 
            : 0;
          
          // Create a product object with mapped fields
          const product = {
            brand_id: brandId,
            name: mapping.name ? (row[mapping.name] || '') : '',
            description: mapping.description ? (row[mapping.description] || '') : '',
            category: mapping.category ? (row[mapping.category] || '') : '',
            mrp: mapping.mrp ? (parseFloat(row[mapping.mrp]) || 0) : 0,
            landing_price: landingPrice,
            client_price: mapping.client_price ? (parseFloat(row[mapping.client_price]) || 0) : 0,
            quotation_price: quotationPrice,
            margin: parseFloat(margin.toFixed(2)),
            
            // Initialize extra_data to store unmapped columns
            extra_data: {}
          };
          
          // Add all unmapped columns to extra_data
          validHeaders.forEach(header => {
            if (!mappedFields.has(header)) {
              product.extra_data[header] = row[header];
            }
          });
          
          return product;
        });
      
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
