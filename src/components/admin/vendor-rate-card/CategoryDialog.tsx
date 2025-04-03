
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { VendorCategory, VendorRateCardService } from '@/services/VendorRateCardService';
import CategoryForm from './CategoryForm';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: VendorCategory;
  onSave: () => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onClose,
  category,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: { name: string; description?: string }) => {
    try {
      setIsSubmitting(true);
      
      if (category) {
        // Update existing category
        await VendorRateCardService.updateCategory(category.id, values);
        toast({
          title: "Category updated",
          description: "The category has been updated successfully.",
        });
      } else {
        // Create new category
        await VendorRateCardService.createCategory(values);
        toast({
          title: "Category created",
          description: "The new category has been created successfully.",
        });
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save category. Please try again.",
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
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <CategoryForm 
          defaultValues={category} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDialog;
