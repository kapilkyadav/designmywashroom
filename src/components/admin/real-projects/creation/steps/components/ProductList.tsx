
import React from 'react';
import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product } from '@/lib/supabase';

interface ProductListProps {
  brandName: string;
  products: Product[];
  loading: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ brandName, products, loading }) => {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <div className="flex items-center gap-1">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-muted-foreground">{brandName} Products</h4>
        </div>
        <Badge variant="secondary">{products.length} product(s)</Badge>
      </div>
      
      <div className="overflow-auto max-h-64 border rounded-md">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs text-right">MRP</TableHead>
              <TableHead className="text-xs text-right">YDS Offer Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {products.length > 0 ? (
              products.slice(0, 10).map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm py-2">{product.name}</TableCell>
                  <TableCell className="text-sm py-2">{product.category || '-'}</TableCell>
                  <TableCell className="text-sm py-2 text-right">₹{product.mrp.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-sm py-2 text-right">₹{product.client_price.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  {loading ? "Loading products..." : "No products available for this brand"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {products.length > 10 && (
          <div className="p-2 text-center text-xs text-muted-foreground">
            Showing 10 of {products.length} products
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
