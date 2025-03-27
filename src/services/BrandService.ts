
import { supabase, Brand } from '@/lib/supabase';

export const BrandService = {
  // Get all brands
  async getAllBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
    
    return data as Brand[];
  },
  
  // Get a brand by ID
  async getBrandById(id: string): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching brand:', error);
      throw error;
    }
    
    return data as Brand;
  },
  
  // Create a new brand
  async createBrand(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at' | 'product_count'>): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .insert({
        ...brand,
        product_count: 0,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
    
    return data as Brand;
  },
  
  // Update a brand
  async updateBrand(id: string, brand: Partial<Brand>): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .update({
        ...brand,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
    
    return data as Brand;
  },
  
  // Delete a brand
  async deleteBrand(id: string): Promise<void> {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  },
  
  // Update Google Sheet connection for a brand
  async updateGoogleSheetConnection(
    id: string, 
    sheetUrl: string, 
    sheetName: string, 
    headerRow: number
  ): Promise<Brand> {
    const { data, error } = await supabase
      .from('brands')
      .update({
        sheet_url: sheetUrl,
        sheet_name: sheetName,
        header_row: headerRow,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating brand Google Sheet connection:', error);
      throw error;
    }
    
    return data as Brand;
  },
};
