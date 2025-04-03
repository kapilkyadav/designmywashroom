
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { VendorItem, VendorRateCard, VendorRateCardService } from '@/services/VendorRateCardService';
import RateCardForm from './RateCardForm';

interface RateCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rateCard?: VendorRateCard;
  items: VendorItem[];
  onSave: () => void;
}

const RateCardDialog: React.FC<RateCardDialogProps> = ({
  isOpen,
  onClose,
  rateCard,
  items,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: Partial<VendorRateCard>) => {
    try {
      setIsSubmitting(true);
      
      if (rateCard) {
        // Update existing rate card
        await VendorRateCardService.updateRateCard(rateCard.id, values);
        toast({
          title: "Rate card updated",
          description: "The rate card has been updated successfully.",
        });
      } else {
        // Create new rate card
        await VendorRateCardService.createRateCard(values as any); // Using 'as any' since we've validated the form
        toast({
          title: "Rate card created",
          description: "The new rate card has been created successfully.",
        });
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving rate card:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save rate card. Please try again.",
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
          <DialogTitle>{rateCard ? 'Edit Rate Card' : 'Add New Rate Card'}</DialogTitle>
        </DialogHeader>
        <RateCardForm 
          defaultValues={rateCard} 
          items={items}
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default RateCardDialog;
