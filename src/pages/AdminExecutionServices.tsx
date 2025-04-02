
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, PencilIcon, TrashIcon, Plus, Filter, Search } from 'lucide-react';

const AdminExecutionServices = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const queryClient = useQueryClient();
  
  // Fetch services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['execution-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('execution_services')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Create or update service
  const mutation = useMutation({
    mutationFn: async (service: any) => {
      if (service.id) {
        // Update existing service
        const { error } = await supabase
          .from('execution_services')
          .update({
            name: service.name,
            description: service.description,
            category: service.category,
            pricing_type: service.pricing_type,
            unit: service.unit
          })
          .eq('id', service.id);
        
        if (error) throw error;
      } else {
        // Create new service
        const { error } = await supabase
          .from('execution_services')
          .insert({
            name: service.name,
            description: service.description,
            category: service.category,
            pricing_type: service.pricing_type,
            unit: service.unit
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution-services'] });
      setIsDialogOpen(false);
      toast({
        title: currentService?.id ? 'Service Updated' : 'Service Created',
        description: `The service has been successfully ${currentService?.id ? 'updated' : 'created'}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save service',
        variant: 'destructive',
      });
    }
  });
  
  // Delete service
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('execution_services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution-services'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: 'Service Deleted',
        description: 'The service has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete service',
        variant: 'destructive',
      });
    }
  });
  
  const handleCreate = () => {
    setCurrentService({
      name: '',
      description: '',
      category: 'Plumbing',
      pricing_type: 'fixed',
      unit: ''
    });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (service: any) => {
    setCurrentService(service);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (service: any) => {
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(currentService);
  };
  
  const confirmDelete = () => {
    if (currentService?.id) {
      deleteMutation.mutate(currentService.id);
    }
  };
  
  const handleInputChange = (field: string, value: string) => {
    setCurrentService((prev: any) => ({ ...prev, [field]: value }));
  };
  
  // Extract unique categories for filtering
  const categories = ['all', ...new Set(services.map(service => service.category))];
  
  // Filter services based on search query and category
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Execution Services</h1>
        
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Manage Execution Services</CardTitle>
          <CardDescription>
            Add, edit, or remove execution services that can be applied to projects
          </CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pricing Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No services found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell>
                        {service.pricing_type === 'fixed' ? 'Fixed Price' : 'Per unit'}
                        {service.unit && ` (${service.unit})`}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {service.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(service)}>
                            <TrashIcon className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Service Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentService?.id ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            <DialogDescription>
              {currentService?.id 
                ? 'Update the details for this execution service'
                : 'Add a new execution service for projects'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveService} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={currentService?.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={currentService?.category || ''}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Tiling">Tiling</SelectItem>
                  <SelectItem value="Carpentry">Carpentry</SelectItem>
                  <SelectItem value="Finishing">Finishing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="pricing-type">Pricing Type</Label>
              <Select
                value={currentService?.pricing_type || ''}
                onValueChange={(value) => handleInputChange('pricing_type', value)}
              >
                <SelectTrigger id="pricing-type">
                  <SelectValue placeholder="Select pricing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="per_unit">Per Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {currentService?.pricing_type === 'per_unit' && (
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={currentService?.unit || ''}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  placeholder="e.g., sq ft, piece, hour"
                  required
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentService?.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentService?.id ? 'Update' : 'Create'} Service
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the service "{currentService?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExecutionServices;
