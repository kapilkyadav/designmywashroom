
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { VendorCategory, VendorItem, VendorRateCardService } from '@/services/VendorRateCardService';
import ItemForm from './ItemForm';

interface ItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item?: VendorItem;
  categories: VendorCategory[];
  onSave: () => void;
}

const ItemDialog: React.FC<ItemDialogProps> = ({
  isOpen,
  onClose,
  item,
  categories,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: { 
    category_id: string; 
    sl_no: string; 
    item_code: string; 
    scope_of_work: string; 
    measuring_unit: string 
  }) => {
    try {
      setIsSubmitting(true);
      
      if (item) {
        // Update existing item
        await VendorRateCardService.updateItem(item.id, values);
        toast({
          title: "Item updated",
          description: "The item has been updated successfully.",
        });
      } else {
        // Create new item
        await VendorRateCardService.createItem(values);
        toast({
          title: "Item created",
          description: "The new item has been created successfully.",
        });
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        </DialogHeader>
        <ItemForm 
          defaultValues={item} 
          categories={categories}
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ItemDialog;
