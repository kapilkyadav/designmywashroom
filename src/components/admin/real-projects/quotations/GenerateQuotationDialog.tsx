
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { RealProject, RealProjectService } from '@/services/RealProjectService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VendorRateCardService } from '@/services/VendorRateCardService';

interface GenerateQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: RealProject;
  quotationTerms: string;
  onQuotationTermsChange: (terms: string) => void;
  onGenerateQuotation: () => Promise<void>;
  isGeneratingQuote: boolean;
}

const GenerateQuotationDialog: React.FC<GenerateQuotationDialogProps> = ({
  open,
  onOpenChange,
  project,
  quotationTerms,
  onQuotationTermsChange,
  onGenerateQuotation,
  isGeneratingQuote
}) => {
  const [items, setItems] = useState<{ name: string; description: string; amount: number; }[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Helper function to safely format currency values
  const formatCurrency = (amount: any): string => {
    // Check if amount exists and is a number
    if (amount === undefined || amount === null) {
      return '₹0';
    }
    
    // Make sure it's a number before calling toLocaleString
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    
    // Handle NaN case
    if (isNaN(numericAmount)) {
      return '₹0';
    }
    
    return `₹${numericAmount.toLocaleString('en-IN')}`;
  };
  
  useEffect(() => {
    const initializeQuotation = async () => {
      setIsCalculating(true);
      
      try {
        // Initialize with execution costs and tiling costs from project
        const costs = await RealProjectService.calculateProjectCosts(
          project.id, 
          project.washrooms || [], 
          project.execution_costs || {}
        );
        
        const newItems = [
          {
            name: 'Execution Services',
            description: 'All execution services as specified',
            amount: costs.execution_services_total || 0
          }
        ];
        
        if (costs.tiling_cost && costs.tiling_cost > 0) {
          newItems.push({
            name: 'Tiling Work',
            description: `Tiling work for ${costs.total_area.toFixed(2)} sq ft area`,
            amount: costs.tiling_cost
          });
        }
        
        // If we have selected services, add them as individual items
        if (project.washrooms) {
          // Extract all unique selected service IDs
          const selectedServices: Record<string, boolean> = {};
          project.washrooms.forEach(washroom => {
            if (washroom.services) {
              Object.entries(washroom.services).forEach(([id, isSelected]) => {
                if (isSelected) {
                  selectedServices[id] = true;
                }
              });
            }
          });
          
          // Get details for all selected service items
          const serviceIds = Object.keys(selectedServices);
          if (serviceIds.length > 0) {
            const serviceItems = await VendorRateCardService.getItemsByIds(serviceIds);
            
            // Get rate cards for these items
            const ratePromises = serviceIds.map(id => VendorRateCardService.getRateCardByItemId(id));
            const rateCards = await Promise.all(ratePromises);
            
            // Create an item for each service with its rate
            rateCards.forEach((rateCard, index) => {
              if (rateCard && serviceItems[index]) {
                const serviceItem = serviceItems.find(item => item.id === serviceIds[index]);
                if (serviceItem) {
                  newItems.push({
                    name: serviceItem.scope_of_work,
                    description: `${serviceItem.category?.name || 'Service'} - ${serviceItem.measuring_unit || 'Unit'}`,
                    amount: rateCard.client_rate || 0
                  });
                }
              }
            });
          }
        }
        
        setItems(newItems);
      } catch (error) {
        console.error('Error initializing quotation:', error);
      } finally {
        setIsCalculating(false);
      }
    };
    
    if (open && project) {
      initializeQuotation();
    }
  }, [open, project]);
  
  const addItem = () => {
    setItems([...items, { name: '', description: '', amount: 0 }]);
  };
  
  const removeItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };
  
  const updateItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };
  
  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Generate Quotation</DialogTitle>
          <DialogDescription>
            Create a new quotation for project {project.project_id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 max-h-[60vh] overflow-y-auto py-4">
          {isCalculating ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Washrooms summary */}
              {project.washrooms && project.washrooms.length > 0 && (
                <div>
                  <Label className="text-base">Washroom Details</Label>
                  <Table className="mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Washroom</TableHead>
                        <TableHead>Dimensions</TableHead>
                        <TableHead className="text-right">Area</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {project.washrooms.map((washroom) => (
                        <TableRow key={washroom.id}>
                          <TableCell>{washroom.name}</TableCell>
                          <TableCell>
                            {washroom.length}' × {washroom.width}' × {washroom.height}'
                          </TableCell>
                          <TableCell className="text-right">
                            {(washroom.length * washroom.width).toFixed(2)} sq ft
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {/* Quotation items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-base">Quotation Items</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addItem}
                    type="button"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-start">
                    <div className="col-span-4">
                      <Label htmlFor={`item-name-${index}`} className="sr-only">
                        Item Name
                      </Label>
                      <Input
                        id={`item-name-${index}`}
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                      />
                    </div>
                    
                    <div className="col-span-5">
                      <Label htmlFor={`item-description-${index}`} className="sr-only">
                        Item Description
                      </Label>
                      <Input
                        id={`item-description-${index}`}
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor={`item-amount-${index}`} className="sr-only">
                        Amount
                      </Label>
                      <div className="flex items-center">
                        <span className="mr-1">₹</span>
                        <Input
                          id={`item-amount-${index}`}
                          type="number"
                          min="0"
                          value={item.amount}
                          onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Total amount */}
                <div className="flex justify-end items-center mt-4 space-x-2 font-medium">
                  <div>Total Amount:</div>
                  <div>{formatCurrency(totalAmount)}</div>
                </div>
              </div>
              
              {/* Terms & conditions */}
              <div className="space-y-2">
                <Label htmlFor="quotation-terms" className="text-base">
                  Terms & Conditions
                </Label>
                <Textarea
                  id="quotation-terms"
                  placeholder="Enter quotation terms and conditions"
                  value={quotationTerms}
                  onChange={(e) => onQuotationTermsChange(e.target.value)}
                  rows={5}
                />
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGeneratingQuote}
          >
            Cancel
          </Button>
          <Button
            disabled={isGeneratingQuote || items.length === 0 || isCalculating}
            onClick={async () => {
              // Prepare quotation data
              const quotationData = {
                items,
                totalAmount,
                terms: quotationTerms,
                washrooms: project.washrooms || []
              };
              
              // Store in context for the parent component
              (window as any).currentQuotationData = quotationData;
              
              // Call the parent's generate function
              await onGenerateQuotation();
            }}
          >
            {isGeneratingQuote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGeneratingQuote ? 'Generating...' : 'Generate Quotation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateQuotationDialog;
