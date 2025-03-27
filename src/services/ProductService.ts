
import { supabase, Product } from '@/lib/supabase';

export const ProductService = {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    
    return data as Product[];
  },
  
  // Get products by brand ID
  async getProductsByBrandId(brandId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('brand_id', brandId)
      .order('name');
    
    if (error) {
      console.error('Error fetching products by brand:', error);
      throw error;
    }
    
    return data as Product[];
  },
  
  // Get a product by ID
  async getProductById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
    
    return data as Product;
  },
  
  // Create a new product
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'margin'>): Promise<Product> {
    const landingPrice = product.landing_price || 0;
    const quotationPrice = product.quotation_price || 0;
    
    // Calculate margin percentage
    const margin = landingPrice > 0 
      ? ((quotationPrice - landingPrice) / landingPrice) * 100 
      : 0;
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        quantity: product.quantity || 0, // Ensure quantity is included
        margin: parseFloat(margin.toFixed(2)),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    
    // Update product count for the brand
    await this.updateBrandProductCount(product.brand_id);
    
    return data as Product;
  },
  
  // Update a product
  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    let updateData: any = {
      ...product,
      updated_at: new Date().toISOString(),
    };
    
    // Recalculate margin if prices changed
    if (product.landing_price !== undefined || product.quotation_price !== undefined) {
      // Get current product data for any missing values
      const currentProduct = await this.getProductById(id);
      
      const landingPrice = product.landing_price !== undefined 
        ? product.landing_price 
        : currentProduct.landing_price;
      
      const quotationPrice = product.quotation_price !== undefined 
        ? product.quotation_price 
        : currentProduct.quotation_price;
      
      // Calculate margin percentage
      const margin = landingPrice > 0 
        ? ((quotationPrice - landingPrice) / landingPrice) * 100 
        : 0;
      
      updateData.margin = parseFloat(margin.toFixed(2));
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    
    return data as Product;
  },
  
  // Delete a product
  async deleteProduct(id: string): Promise<void> {
    // Get brand_id before deleting for updating product count
    const { data: product } = await supabase
      .from('products')
      .select('brand_id')
      .eq('id', id)
      .single();
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
    
    // Update product count for the brand
    if (product && product.brand_id) {
      await this.updateBrandProductCount(product.brand_id);
    }
  },
  
  // Import products from mapped Google Sheet data
  async importProductsFromSheet(
    brandId: string,
    products: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'margin' | 'brand_id'>[]
  ): Promise<number> {
    if (!brandId) {
      throw new Error('Brand ID is required for importing products');
    }
    
    if (!products || products.length === 0) {
      throw new Error('No products provided for import');
    }
    
    try {
      // Calculate margins and add brand_id to each product
      const productsWithMargins = products.map(product => {
        const landingPrice = product.landing_price || 0;
        const quotationPrice = product.quotation_price || 0;
        
        // Calculate margin percentage
        const margin = landingPrice > 0 
          ? ((quotationPrice - landingPrice) / landingPrice) * 100 
          : 0;
        
        return {
          ...product,
          brand_id: brandId,
          quantity: product.quantity || 0, // Ensure quantity is included
          margin: parseFloat(margin.toFixed(2))
        };
      });
      
      // Insert in batches if necessary
      const { data, error } = await supabase
        .from('products')
        .insert(productsWithMargins)
        .select('id');
      
      if (error) {
        console.error('Error importing products:', error);
        throw error;
      }
      
      // Update product count for the brand
      await this.updateBrandProductCount(brandId);
      
      return data.length;
    } catch (error) {
      console.error('Error in importProductsFromSheet:', error);
      throw error;
    }
  },
  
  // Helper method to update product count for a brand
  async updateBrandProductCount(brandId: string): Promise<void> {
    // Count products for this brand
    const { count, error: countError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('brand_id', brandId);
    
    if (countError) {
      console.error('Error counting products:', countError);
      return;
    }
    
    // Update the brand's product_count
    const { error: updateError } = await supabase
      .from('brands')
      .update({ product_count: count || 0 })
      .eq('id', brandId);
    
    if (updateError) {
      console.error('Error updating brand product count:', updateError);
    }
  }
};
