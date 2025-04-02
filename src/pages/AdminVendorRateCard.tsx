
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { VendorCategory, VendorItem, VendorRateCard, VendorRateCardService } from '@/services/VendorRateCardService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Plus, Trash2 } from 'lucide-react';
import CategoryDialog from '@/components/admin/vendor-rate-card/CategoryDialog';
import ItemDialog from '@/components/admin/vendor-rate-card/ItemDialog';
import RateCardDialog from '@/components/admin/vendor-rate-card/RateCardDialog';
import DeleteConfirmDialog from '@/components/admin/vendor-rate-card/DeleteConfirmDialog';

const AdminVendorRateCard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('categories');
  
  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | undefined>(undefined);
  
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VendorItem | undefined>(undefined);
  
  const [rateCardDialogOpen, setRateCardDialogOpen] = useState(false);
  const [selectedRateCard, setSelectedRateCard] = useState<VendorRateCard | undefined>(undefined);
  
  // Delete confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogConfig, setDeleteDialogConfig] = useState({
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Query categories, items, and rate cards
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['vendor-categories'],
    queryFn: () => VendorRateCardService.getCategories(),
  });

  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['vendor-items'],
    queryFn: () => VendorRateCardService.getItems(),
  });

  const { data: rateCards = [], isLoading: isLoadingRateCards } = useQuery({
    queryKey: ['vendor-rate-cards'],
    queryFn: () => VendorRateCardService.getRateCards(),
  });

  // Refresh data after actions
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-categories'] });
    queryClient.invalidateQueries({ queryKey: ['vendor-items'] });
    queryClient.invalidateQueries({ queryKey: ['vendor-rate-cards'] });
  };

  // Category handlers
  const openAddCategory = () => {
    setSelectedCategory(undefined);
    setCategoryDialogOpen(true);
  };

  const openEditCategory = (category: VendorCategory) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const openDeleteCategory = (category: VendorCategory) => {
    setDeleteDialogConfig({
      title: 'Delete Category',
      description: `Are you sure you want to delete the category "${category.name}"? This will also delete all associated items and rate cards.`,
      onConfirm: async () => {
        try {
          await VendorRateCardService.deleteCategory(category.id);
          toast({
            title: "Category deleted",
            description: "The category has been deleted successfully.",
          });
          refreshData();
        } catch (error: any) {
          toast({
            title: "Error deleting category",
            description: error.message || "Failed to delete category. Please try again.",
            variant: "destructive",
          });
        } finally {
          setDeleteDialogOpen(false);
        }
      },
    });
    setDeleteDialogOpen(true);
  };

  // Item handlers
  const openAddItem = () => {
    setSelectedItem(undefined);
    setItemDialogOpen(true);
  };

  const openEditItem = (item: VendorItem) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };

  const openDeleteItem = (item: VendorItem) => {
    setDeleteDialogConfig({
      title: 'Delete Item',
      description: `Are you sure you want to delete the item "${item.scope_of_work}"? This will also delete all associated rate cards.`,
      onConfirm: async () => {
        try {
          await VendorRateCardService.deleteItem(item.id);
          toast({
            title: "Item deleted",
            description: "The item has been deleted successfully.",
          });
          refreshData();
        } catch (error: any) {
          toast({
            title: "Error deleting item",
            description: error.message || "Failed to delete item. Please try again.",
            variant: "destructive",
          });
        } finally {
          setDeleteDialogOpen(false);
        }
      },
    });
    setDeleteDialogOpen(true);
  };

  // Rate card handlers
  const openAddRateCard = () => {
    setSelectedRateCard(undefined);
    setRateCardDialogOpen(true);
  };

  const openEditRateCard = (rateCard: VendorRateCard) => {
    setSelectedRateCard(rateCard);
    setRateCardDialogOpen(true);
  };

  const openDeleteRateCard = (rateCard: VendorRateCard) => {
    const itemName = items.find(item => item.id === rateCard.item_id)?.scope_of_work || 'Unknown';
    
    setDeleteDialogConfig({
      title: 'Delete Rate Card',
      description: `Are you sure you want to delete the rate card for "${itemName}"?`,
      onConfirm: async () => {
        try {
          await VendorRateCardService.deleteRateCard(rateCard.id);
          toast({
            title: "Rate card deleted",
            description: "The rate card has been deleted successfully.",
          });
          refreshData();
        } catch (error: any) {
          toast({
            title: "Error deleting rate card",
            description: error.message || "Failed to delete rate card. Please try again.",
            variant: "destructive",
          });
        } finally {
          setDeleteDialogOpen(false);
        }
      },
    });
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendor Rate Card Management</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="rate-cards">Rate Cards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Work Categories</CardTitle>
                  <CardDescription>Manage main categories of work</CardDescription>
                </div>
                <Button onClick={openAddCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCategories ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No categories found. Click the "Add Category" button to create one.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditCategory(category)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteCategory(category)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Work Items</CardTitle>
                  <CardDescription>Manage detailed work items and subcategories</CardDescription>
                </div>
                <Button onClick={openAddItem} disabled={categories.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingItems ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {categories.length === 0 
                    ? "Please create a category first before adding items."
                    : "No items found. Click the \"Add Item\" button to create one."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SL No</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Scope of Work</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.sl_no}</TableCell>
                        <TableCell>{item.item_code}</TableCell>
                        <TableCell>
                          {item.category?.name || 
                            categories.find(c => c.id === item.category_id)?.name || 
                            'Unknown'}
                        </TableCell>
                        <TableCell>{item.scope_of_work}</TableCell>
                        <TableCell>{item.measuring_unit}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditItem(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteItem(item)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rate-cards">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rate Cards</CardTitle>
                  <CardDescription>Manage rate information for work items</CardDescription>
                </div>
                <Button onClick={openAddRateCard} disabled={items.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate Card
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRateCards ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : rateCards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {items.length === 0 
                    ? "Please create items first before adding rate cards."
                    : "No rate cards found. Click the \"Add Rate Card\" button to create one."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Vendor Rate 1</TableHead>
                      <TableHead>Vendor Rate 2</TableHead>
                      <TableHead>Vendor Rate 3</TableHead>
                      <TableHead>Client Rate</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rateCards.map((rateCard) => {
                      const item = items.find(i => i.id === rateCard.item_id) || 
                                  rateCard.item || 
                                  { scope_of_work: 'Unknown', category_id: '' };
                      
                      const categoryId = 'category' in item ? item.category?.id : item.category_id;
                      const categoryName = 'category' in item && item.category ? 
                          item.category.name : 
                          categories.find(c => c.id === categoryId)?.name || 'Unknown';
                      
                      return (
                        <TableRow key={rateCard.id}>
                          <TableCell>{item.scope_of_work}</TableCell>
                          <TableCell>{categoryName}</TableCell>
                          <TableCell>{rateCard.vendor_rate1 ? `₹${rateCard.vendor_rate1}` : '-'}</TableCell>
                          <TableCell>{rateCard.vendor_rate2 ? `₹${rateCard.vendor_rate2}` : '-'}</TableCell>
                          <TableCell>{rateCard.vendor_rate3 ? `₹${rateCard.vendor_rate3}` : '-'}</TableCell>
                          <TableCell>{`₹${rateCard.client_rate}`}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditRateCard(rateCard)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteRateCard(rateCard)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      <CategoryDialog
        isOpen={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        category={selectedCategory}
        onSave={refreshData}
      />
      
      <ItemDialog
        isOpen={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        item={selectedItem}
        categories={categories}
        onSave={refreshData}
      />
      
      <RateCardDialog
        isOpen={rateCardDialogOpen}
        onClose={() => setRateCardDialogOpen(false)}
        rateCard={selectedRateCard}
        items={items}
        onSave={refreshData}
      />
      
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={deleteDialogConfig.onConfirm}
        title={deleteDialogConfig.title}
        description={deleteDialogConfig.description}
      />
    </>
  );
};

export default AdminVendorRateCard;
