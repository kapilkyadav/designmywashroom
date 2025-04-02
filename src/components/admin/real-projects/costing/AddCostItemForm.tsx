
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { CostItem } from './types';

interface AddCostItemFormProps {
  onAddItem: (item: CostItem) => void;
}

const AddCostItemForm: React.FC<AddCostItemFormProps> = ({ onAddItem }) => {
  const [newItemCategory, setNewItemCategory] = useState<CostItem['category']>('execution');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  const handleAddItem = () => {
    if (!newItemName || !newItemAmount) return;
    
    const newItem: CostItem = {
      id: `item_${Date.now()}`,
      name: newItemName,
      description: newItemDesc,
      amount: parseFloat(newItemAmount),
      category: newItemCategory
    };
    
    onAddItem(newItem);
    
    // Clear inputs
    setNewItemName('');
    setNewItemDesc('');
    setNewItemAmount('');
  };

  return (
    <>
      <h3 className="text-lg font-medium">Add New Cost Item</h3>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-sm font-medium col-span-1">Category</label>
          <div className="col-span-3">
            <select 
              value={newItemCategory} 
              onChange={(e) => setNewItemCategory(e.target.value as CostItem['category'])}
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
          <Button onClick={handleAddItem} disabled={!newItemName || !newItemAmount}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddCostItemForm;
