
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Search, Plus, FilePenLine, Trash2, Loader2, 
  Download, Upload, Filter
} from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

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
          product.description.toLowerCase().includes(query)
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

  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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

  // Get brand name by ID
  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown Brand';
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
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Brand</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">MRP</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Landing Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Client Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Margin</th>
                  <th className="w-[100px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-secondary/50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{product.description}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{getBrandName(product.brand_id)}</td>
                      <td className="px-4 py-3 text-sm">{product.category}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(product.mrp)}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(product.landing_price)}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(product.client_price)}</td>
                      <td className="px-4 py-3 text-sm">{product.margin.toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <FilePenLine className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      {searchQuery.trim() !== '' || brandFilter || categoryFilter
                        ? "No products matching your filters" 
                        : "No products found. Add your first product to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
