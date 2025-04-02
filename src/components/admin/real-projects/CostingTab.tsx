
import React, { useState } from 'react';
import { RealProject, RealProjectService } from '@/services/RealProjectService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CostingTabProps {
  project: RealProject;
  onUpdate: () => void;
}

interface CostItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: string;
}

const CostingTab: React.FC<CostingTabProps> = ({ project, onUpdate }) => {
  // Parse existing costs from project
  const initialExecutionCosts = Object.entries(project.execution_costs || {}).map(([id, item]: [string, any]) => ({
    id,
    ...item,
    category: 'execution'
  }));
  
  const initialVendorRates = Object.entries(project.vendor_rates || {}).map(([id, item]: [string, any]) => ({
    id,
    ...item,
    category: 'vendor'
  }));
  
  const initialAdditionalCosts = Object.entries(project.additional_costs || {}).map(([id, item]: [string, any]) => ({
    id,
    ...item,
    category: 'additional'
  }));
  
  const [executionCosts, setExecutionCosts] = useState<CostItem[]>(initialExecutionCosts);
  const [vendorRates, setVendorRates] = useState<CostItem[]>(initialVendorRates);
  const [additionalCosts, setAdditionalCosts] = useState<CostItem[]>(initialAdditionalCosts);
  
  const [isSaving, setIsSaving] = useState(false);
  
  // New item inputs
  const [newItemCategory, setNewItemCategory] = useState('execution');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  
  const addNewItem = () => {
    if (!newItemName || !newItemAmount) return;
    
    const newItem: CostItem = {
      id: `item_${Date.now()}`,
      name: newItemName,
      description: newItemDesc,
      amount: parseFloat(newItemAmount),
      category: newItemCategory
    };
    
    if (newItemCategory === 'execution') {
      setExecutionCosts([...executionCosts, newItem]);
    } else if (newItemCategory === 'vendor') {
      setVendorRates([...vendorRates, newItem]);
    } else {
      setAdditionalCosts([...additionalCosts, newItem]);
    }
    
    // Clear inputs
    setNewItemName('');
    setNewItemDesc('');
    setNewItemAmount('');
  };
  
  const removeItem = (id: string, category: string) => {
    if (category === 'execution') {
      setExecutionCosts(executionCosts.filter(item => item.id !== id));
    } else if (category === 'vendor') {
      setVendorRates(vendorRates.filter(item => item.id !== id));
    } else {
      setAdditionalCosts(additionalCosts.filter(item => item.id !== id));
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Convert arrays to objects for storage
      const executionCostsObj = executionCosts.reduce((acc, item) => {
        const { category, ...rest } = item;
        acc[item.id] = rest;
        return acc;
      }, {} as Record<string, any>);
      
      const vendorRatesObj = vendorRates.reduce((acc, item) => {
        const { category, ...rest } = item;
        acc[item.id] = rest;
        return acc;
      }, {} as Record<string, any>);
      
      const additionalCostsObj = additionalCosts.reduce((acc, item) => {
        const { category, ...rest } = item;
        acc[item.id] = rest;
        return acc;
      }, {} as Record<string, any>);
      
      // Calculate total amount
      const totalAmount = [...executionCosts, ...vendorRates, ...additionalCosts]
        .reduce((sum, item) => sum + item.amount, project.original_estimate || 0);
      
      await RealProjectService.updateRealProject(project.id, {
        execution_costs: executionCostsObj,
        vendor_rates: vendorRatesObj,
        additional_costs: additionalCostsObj,
        final_quotation_amount: totalAmount
      });
      
      onUpdate();
    } finally {
      setIsSaving(false);
    }
  };
  
  // Calculate totals
  const executionTotal = executionCosts.reduce((sum, item) => sum + item.amount, 0);
  const vendorTotal = vendorRates.reduce((sum, item) => sum + item.amount, 0);
  const additionalTotal = additionalCosts.reduce((sum, item) => sum + item.amount, 0);
  const grandTotal = executionTotal + vendorTotal + additionalTotal + (project.original_estimate || 0);

  const renderCostTable = (items: CostItem[], title: string, description: string) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Total: ₹{items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
        </Badge>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount (₹)</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                  No items added
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell>
                    {item.description || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id, item.category)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {project.original_estimate ? (
        <Alert>
          <AlertDescription className="flex justify-between items-center">
            <span>Original Estimate:</span>
            <span className="font-medium">₹{project.original_estimate.toLocaleString('en-IN')}</span>
          </AlertDescription>
        </Alert>
      ) : null}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium">Add New Cost Item</h3>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-sm font-medium col-span-1">Category</label>
                <div className="col-span-3">
                  <select 
                    value={newItemCategory} 
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  >
                    <option value="execution">Execution Cost</option>
                    <option value="vendor">Vendor Rate</option>
                    <option value="additional">Additional Cost</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-sm font-medium col-span-1">Name</label>
                <div className="col-span-3">
                  <Input 
                    value={newItemName} 
                    onChange={(e) => setNewItemName(e.target.value)} 
                    placeholder="e.g. Labor"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-sm font-medium col-span-1">Description</label>
                <div className="col-span-3">
                  <Textarea 
                    value={newItemDesc} 
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    placeholder="Optional description"
                    className="resize-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-sm font-medium col-span-1">Amount (₹)</label>
                <div className="col-span-3">
                  <Input 
                    type="number" 
                    value={newItemAmount} 
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={addNewItem} disabled={!newItemName || !newItemAmount}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium">Summary</h3>
            
            <div className="mt-4 space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span>Original Estimate</span>
                <span>₹{(project.original_estimate || 0).toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span>Execution Costs</span>
                <span>₹{executionTotal.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span>Vendor Rates</span>
                <span>₹{vendorTotal.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span>Additional Costs</span>
                <span>₹{additionalTotal.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between pt-4 font-bold">
                <span>Final Quotation Amount</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save All Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-8 mt-8">
        {renderCostTable(executionCosts, 'Execution Costs', 'Costs related to project execution and labor')}
        {renderCostTable(vendorRates, 'Vendor Rates', 'Costs from vendors and material suppliers')}
        {renderCostTable(additionalCosts, 'Additional Costs', 'Any extra costs associated with the project')}
      </div>
    </div>
  );
};

export default CostingTab;
