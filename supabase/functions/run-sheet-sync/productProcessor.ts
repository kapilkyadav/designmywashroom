
import { createDefaultMapping, mapRowToProduct, addUnmappedColumnsToExtraData } from './utils';

export async function processSheetProducts(
  sheetData: any,
  brandId: string,
  brand: any,
  supabase: any,
  headers: string[]
) {
  // Get column mapping from brand or use default mapping
  let columnMapping = brand.column_mapping || createDefaultMapping(headers);
  
  // If we created a default mapping, update the brand record
  if (!brand.column_mapping) {
    await supabase
      .from('brands')
      .update({ column_mapping: columnMapping })
      .eq('id', brandId);
  }
  
  // Map sheet data to product structure using the column mapping
  const products = sheetData
    .filter((row: any) => columnMapping.name && row[columnMapping.name]) // Filter out rows with no names
    .map((row: any) => {
      // Create base product with mapped values
      let product = mapRowToProduct(row, columnMapping, brandId);
      
      // Add unmapped columns to extra_data
      return addUnmappedColumnsToExtraData(product, row, headers, columnMapping);
    });
  
  return products;
}

export async function performUpserts(products: any[], brandId: string, supabase: any) {
  // First, get existing products for this brand
  const { data: existingProducts, error: productsError } = await supabase
    .from('products')
    .select('id, name')
    .eq('brand_id', brandId);
  
  if (productsError) throw productsError;
  
  // Create a map of product names to IDs
  const productMap = new Map();
  existingProducts.forEach((product: any) => {
    productMap.set(product.name.toLowerCase(), product.id);
  });
  
  // Split products into updates and inserts
  const updates = [];
  const inserts = [];
  
  products.forEach(product => {
    const existingId = productMap.get(product.name.toLowerCase());
    if (existingId) {
      updates.push({
        id: existingId,
        ...product
      });
    } else {
      inserts.push(product);
    }
  });
  
  // Perform upserts in batches if needed
  let inserted = 0;
  let updated = 0;
  
  // Insert new products
  if (inserts.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .insert(inserts)
      .select('id');
    
    if (error) throw error;
    inserted = data.length;
  }
  
  // Update existing products
  if (updates.length > 0) {
    for (const product of updates) {
      const { error } = await supabase
        .from('products')
        .update(product)
        .eq('id', product.id);
      
      if (error) throw error;
      updated++;
    }
  }
  
  return { inserted, updated };
}
