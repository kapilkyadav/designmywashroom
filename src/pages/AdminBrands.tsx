
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrandService } from '@/services/BrandService';
import { Brand } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  Search, Plus, FilePenLine, Trash2, Loader2, 
  FileSpreadsheet, ExternalLink 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminBrands = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBrands(brands);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = brands.filter(
        brand => brand.name.toLowerCase().includes(query) || 
                brand.description.toLowerCase().includes(query)
      );
      setFilteredBrands(filtered);
    }
  }, [searchQuery, brands]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await BrandService.getAllBrands();
      setBrands(data);
      setFilteredBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast({
        title: "Error",
        description: "Failed to load brands",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (brandId: string) => {
    try {
      setIsDeleteLoading(true);
      await BrandService.deleteBrand(brandId);
      setBrands(prevBrands => prevBrands.filter(brand => brand.id !== brandId));
      toast({
        title: "Brand deleted",
        description: "The brand has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast({
        title: "Error",
        description: "Failed to delete brand",
        variant: "destructive",
      });
    } finally {
      setIsDeleteLoading(false);
      setDeletingBrandId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Brands</h1>
        <Button onClick={() => navigate('/admin/brands/add')}>
          <Plus className="mr-2 h-4 w-4" /> Add Brand
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                  <th className="w-[50px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Brand</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Products</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Google Sheet</th>
                  <th className="w-[150px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand, index) => (
                    <tr key={brand.id} className="border-t hover:bg-secondary/50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 font-medium">{brand.name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{brand.description}</td>
                      <td className="px-4 py-3 text-sm">{brand.product_count || 0}</td>
                      <td className="px-4 py-3 text-sm">
                        {brand.sheet_url ? (
                          <div className="flex items-center">
                            <FileSpreadsheet className="h-4 w-4 mr-1 text-green-600" />
                            <span className="text-xs">Connected</span>
                            {brand.sheet_url && (
                              <a 
                                href={brand.sheet_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-1 text-primary hover:text-primary/80"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not connected</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <FilePenLine className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit {brand.name}</DialogTitle>
                                <DialogDescription>
                                  Edit brand details or configure Google Sheet integration
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p>This feature will be implemented soon.</p>
                              </div>
                              <DialogFooter>
                                <Button variant="secondary">
                                  Close
                                </Button>
                                <Button>
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive hover:text-destructive" 
                                onClick={() => setDeletingBrandId(brand.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the brand "{brand.name}" and all its products. 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeletingBrandId(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(brand.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={isDeleteLoading}
                                >
                                  {isDeleteLoading && deletingBrandId === brand.id ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      {searchQuery.trim() !== '' 
                        ? "No brands found matching your search query" 
                        : "No brands found. Add your first brand to get started."}
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

export default AdminBrands;
