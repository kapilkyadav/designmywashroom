
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { 
  FilePenLine, 
  Trash2, 
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Product, Brand } from '@/lib/supabase';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductTableProps {
  products: Product[];
  brands: Brand[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onDeleteMultiple: (productIds: string[]) => void;
}

type SortField = 'name' | 'brand' | 'category' | 'mrp' | 'landing_price' | 'client_price' | 'quotation_price' | 'margin' | 'quantity';
type SortDirection = 'asc' | 'desc';

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  brands,
  onEdit,
  onDelete,
  onDeleteMultiple
}) => {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get brand name by ID
  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown Brand';
  };
  
  // Handle sort
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortField) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'brand':
        valueA = getBrandName(a.brand_id).toLowerCase();
        valueB = getBrandName(b.brand_id).toLowerCase();
        break;
      case 'category':
        valueA = (a.category || '').toLowerCase();
        valueB = (b.category || '').toLowerCase();
        break;
      case 'quantity':
        valueA = a.quantity || 0;
        valueB = b.quantity || 0;
        break;
      default:
        valueA = a[sortField];
        valueB = b[sortField];
    }
    
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Handle selecting all products
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(products.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };
  
  // Handle selecting a single product
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds(prev => [...prev, productId]);
    } else {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };
  
  // Handle deleting selected products
  const handleDeleteSelected = () => {
    onDeleteMultiple(selectedProductIds);
    setSelectedProductIds([]);
  };
  
  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    
    return sortDirection === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />;
  };

  return (
    <>
      {selectedProductIds.length > 0 && (
        <div className="mb-4 p-2 bg-secondary rounded-md flex items-center justify-between">
          <span className="text-sm">
            {selectedProductIds.length} product{selectedProductIds.length > 1 ? 's' : ''} selected
          </span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setProductToDelete('multiple')}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={products.length > 0 && selectedProductIds.length === products.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all products"
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Product Name
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('brand')}
                >
                  <div className="flex items-center">
                    Brand
                    {getSortIcon('brand')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {getSortIcon('category')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('mrp')}
                >
                  <div className="flex items-center">
                    MRP
                    {getSortIcon('mrp')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('landing_price')}
                >
                  <div className="flex items-center">
                    Landing Price
                    {getSortIcon('landing_price')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('client_price')}
                >
                  <div className="flex items-center">
                    Client Price
                    {getSortIcon('client_price')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('quotation_price')}
                >
                  <div className="flex items-center">
                    Quotation Price
                    {getSortIcon('quotation_price')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center">
                    Qty
                    {getSortIcon('quantity')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('margin')}
                >
                  <div className="flex items-center">
                    Margin
                    {getSortIcon('margin')}
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.length > 0 ? (
                sortedProducts.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell>
                      <Checkbox 
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={(checked) => 
                          handleSelectProduct(product.id, checked as boolean)
                        }
                        aria-label={`Select ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{product.description}</div>
                    </TableCell>
                    <TableCell>{getBrandName(product.brand_id)}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.mrp)}</TableCell>
                    <TableCell>{formatCurrency(product.landing_price)}</TableCell>
                    <TableCell>{formatCurrency(product.client_price)}</TableCell>
                    <TableCell>{formatCurrency(product.quotation_price)}</TableCell>
                    <TableCell>{product.quantity || 0}</TableCell>
                    <TableCell>
                      <span className={product.margin > 0 ? "text-green-600" : "text-red-600"}>
                        {product.margin.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEdit(product)}
                        >
                          <FilePenLine className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => setProductToDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {productToDelete === 'multiple' 
                ? 'Delete Selected Products' 
                : 'Delete Product'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete === 'multiple'
                ? `Are you sure you want to delete ${selectedProductIds.length} selected products?`
                : 'Are you sure you want to delete this product? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (productToDelete === 'multiple') {
                  handleDeleteSelected();
                } else if (productToDelete) {
                  onDelete(productToDelete);
                }
                setProductToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductTable;
