
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ProductService } from '@/services/ProductService';
import { BrandService } from '@/services/BrandService';
import { Product, Brand } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  Search, Plus, Loader2, 
  Download, Upload, Filter
} from 'lucide-react';
import ProductTable from '@/components/admin/products/ProductTable';
import ProductForm from '@/components/admin/products/ProductForm';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, brandFilter, categoryFilter, products]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, brandsData] = await Promise.all([
        ProductService.getAllProducts(),
        BrandService.getAllBrands()
      ]);
      setProducts(productsData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];
    
    // Apply search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply brand filter
    if (brandFilter) {
      filtered = filtered.filter(product => product.brand_id === brandFilter);
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }
    
    setFilteredProducts(filtered);
  };

  // Get distinct categories from products
  const getUniqueCategories = () => {
    const categories = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    return Array.from(categories);
  };
  
  // Handle adding/editing product
  const handleSaveProduct = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      if (editingProduct) {
        // Update existing product
        await ProductService.updateProduct(editingProduct.id, data);
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully",
        });
      } else {
        // Create new product
        await ProductService.createProduct(data);
        toast({
          title: "Product Added",
          description: "New product has been added successfully",
        });
      }
      
      // Refresh product list
      await fetchData();
      
      // Close the form dialog
      setIsFormOpen(false);
      setEditingProduct(null);
      
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle product edit click
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };
  
  // Handle product delete
  const handleDeleteProduct = async (productId: string) => {
    try {
      await ProductService.deleteProduct(productId);
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );
      
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };
  
  // Handle multiple products delete
  const handleDeleteMultipleProducts = async (productIds: string[]) => {
    try {
      // Create a promise for each delete operation
      const deletePromises = productIds.map(id => 
        ProductService.deleteProduct(id)
      );
      
      // Wait for all deletes to complete
      await Promise.all(deletePromises);
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.filter(product => !productIds.includes(product.id))
      );
      
      toast({
        title: "Products Deleted",
        description: `${productIds.length} products have been deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting multiple products:', error);
      toast({
        title: "Error",
        description: "Failed to delete some products",
        variant: "destructive",
      });
    }
  };
  
  // Open product form dialog for new product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
          <CardDescription>
            View, filter, and manage all your products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or description..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Brands</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {getUniqueCategories().map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ProductTable 
              products={filteredProducts}
              brands={brands}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onDeleteMultiple={handleDeleteMultipleProducts}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? "Update the product details below." 
                : "Enter the details for the new product."}
            </DialogDescription>
          </DialogHeader>
          
          <ProductForm 
            product={editingProduct || undefined}
            brands={brands}
            onSubmit={handleSaveProduct}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
