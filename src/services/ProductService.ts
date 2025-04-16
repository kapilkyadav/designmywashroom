
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Brand, Product } from '@/lib/supabase';

export class ProductService {
  static async getBrands(): Promise<Brand[]> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      return [];
    }
  }
  
  static async getBrandByName(brandName: string): Promise<Brand | null> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .ilike('name', brandName)
        .maybeSingle();
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error(`Error fetching brand by name "${brandName}":`, error);
      return null;
    }
  }
  
  static async getBrandById(brandId: string): Promise<Brand | null> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .maybeSingle();
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error fetching brand by ID:', error);
      return null;
    }
  }
  
  static async getProductsByBrandId(brandId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('brand_id', brandId);
      
      if (error) throw error;
      
      return data || [];
    } catch (error: any) {
      console.error('Error fetching products by brand ID:', error);
      return [];
    }
  }
  
  static async getProduct(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      return null;
    }
  }
  
  static async saveProduct(product: Partial<Product>): Promise<Product | null> {
    try {
      // Determine if we're updating or inserting
      const isUpdating = !!product.id;
      
      if (isUpdating) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update({
            name: product.name,
            description: product.description,
            category: product.category,
            finish_color: product.finish_color,
            series: product.series,
            model_code: product.model_code,
            size: product.size,
            mrp: product.mrp,
            landing_price: product.landing_price,
            client_price: product.client_price,
            quotation_price: product.quotation_price,
            margin: product.margin,
            quantity: product.quantity,
            extra_data: product.extra_data,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id)
          .select()
          .single();
        
        if (error) throw error;
        
        toast({
          title: 'Product updated',
          description: `Product "${data.name}" has been updated.`,
        });
        
        return data;
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            brand_id: product.brand_id,
            name: product.name,
            description: product.description,
            category: product.category,
            finish_color: product.finish_color,
            series: product.series,
            model_code: product.model_code,
            size: product.size,
            mrp: product.mrp || 0,
            landing_price: product.landing_price || 0,
            client_price: product.client_price || 0,
            quotation_price: product.quotation_price || 0,
            margin: product.margin || 0,
            quantity: product.quantity || 0,
            extra_data: product.extra_data
          })
          .select()
          .single();
        
        if (error) throw error;
        
        toast({
          title: 'Product added',
          description: `Product "${data.name}" has been added.`,
        });
        
        return data;
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        variant: 'destructive',
      });
      
      return null;
    }
  }
  
  static async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      toast({
        title: 'Product deleted',
        description: 'Product has been removed.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
      
      return false;
    }
  }
  
  static async updateBrandProductCount(brandId: string): Promise<void> {
    try {
      // Get count of products for the brand
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId);
      
      if (countError) throw countError;
      
      // Update brand with the count
      const { error: updateError } = await supabase
        .from('brands')
        .update({ product_count: count || 0 })
        .eq('id', brandId);
      
      if (updateError) throw updateError;
    } catch (error: any) {
      console.error('Error updating brand product count:', error);
    }
  }
}
