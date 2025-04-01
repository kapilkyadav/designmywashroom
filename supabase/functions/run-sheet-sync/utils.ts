
export function extractSheetId(url: string): string | null {
  // Extract the sheet ID from a Google Sheets URL
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

export interface ColumnMapping {
  name: string;
  description: string;
  category: string;
  finish_color: string;
  series: string;
  model_code: string;
  size: string;
  mrp: string;
  landing_price: string;
  client_price: string;
  quotation_price: string;
  quantity: string;
}

export function createDefaultMapping(headers: string[]): ColumnMapping {
  // Default mapping based on common column names
  return {
    name: headers.find(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('product')) || '',
    description: headers.find(h => h.toLowerCase().includes('desc')) || '',
    category: headers.find(h => h.toLowerCase().includes('categ') || h.toLowerCase().includes('area')) || '',
    finish_color: headers.find(h => h.toLowerCase().includes('finish') || h.toLowerCase().includes('color')) || '',
    series: headers.find(h => h.toLowerCase().includes('series')) || '',
    model_code: headers.find(h => h.toLowerCase().includes('model') || h.toLowerCase().includes('code')) || '',
    size: headers.find(h => h.toLowerCase().includes('size')) || '',
    mrp: headers.find(h => h.toLowerCase().includes('mrp')) || '',
    landing_price: headers.find(h => (h.toLowerCase().includes('offer') || h.toLowerCase().includes('yds offer'))) || '',
    client_price: headers.find(h => (h.toLowerCase().includes('client') && h.toLowerCase().includes('price'))) || '',
    quotation_price: headers.find(h => (h.toLowerCase().includes('yds price'))) || '',
    quantity: headers.find(h => (h.toLowerCase().includes('qty') || h.toLowerCase().includes('quant'))) || ''
  };
}

export function mapRowToProduct(row: any, columnMapping: ColumnMapping, brandId: string) {
  const landingPrice = columnMapping.landing_price ? parseFloat(row[columnMapping.landing_price]) || 0 : 0;
  const quotationPrice = columnMapping.quotation_price ? parseFloat(row[columnMapping.quotation_price]) || 0 : 0;
  const quantity = columnMapping.quantity ? parseInt(row[columnMapping.quantity], 10) || 0 : 0;
  
  // Calculate margin
  const margin = landingPrice > 0 
    ? ((quotationPrice - landingPrice) / landingPrice) * 100 
    : 0;
  
  // Create product object
  const product = {
    brand_id: brandId,
    name: columnMapping.name ? (row[columnMapping.name] || '') : '',
    description: columnMapping.description ? (row[columnMapping.description] || '') : '',
    category: columnMapping.category ? (row[columnMapping.category] || '') : '',
    finish_color: columnMapping.finish_color ? (row[columnMapping.finish_color] || '') : '',
    series: columnMapping.series ? (row[columnMapping.series] || '') : '',
    model_code: columnMapping.model_code ? (row[columnMapping.model_code] || '') : '',
    size: columnMapping.size ? (row[columnMapping.size] || '') : '',
    mrp: columnMapping.mrp ? (parseFloat(row[columnMapping.mrp]) || 0) : 0,
    landing_price: landingPrice,
    client_price: columnMapping.client_price ? (parseFloat(row[columnMapping.client_price]) || 0) : 0,
    quotation_price: quotationPrice,
    quantity: quantity,
    margin: parseFloat(margin.toFixed(2)),
    extra_data: {} as Record<string, any>
  };
  
  return product;
}

export function addUnmappedColumnsToExtraData(product: any, row: any, headers: string[], columnMapping: ColumnMapping) {
  // Add all unmapped columns to extra_data
  const mappedColumns = new Set(Object.values(columnMapping).filter(Boolean));
  headers.forEach((header: string) => {
    if (!mappedColumns.has(header)) {
      product.extra_data[header] = row[header];
    }
  });
  
  return product;
}
