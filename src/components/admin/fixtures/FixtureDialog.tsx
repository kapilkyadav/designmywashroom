
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Fixture } from '@/lib/supabase';
import { FixtureService } from '@/services/FixtureService';
import { toast } from '@/hooks/use-toast';
import FixtureForm from './FixtureForm';

interface FixtureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fixture?: Fixture;
  onFixtureSaved: () => void;
}

const FixtureDialog: React.FC<FixtureDialogProps> = ({
  isOpen,
  onClose,
  fixture,
  onFixtureSaved
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const isEditMode = !!fixture;
  
  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode && fixture) {
        await FixtureService.updateFixture(fixture.id, data);
        toast({
          title: "Success",
          description: "Fixture updated successfully",
        });
      } else {
        await FixtureService.createFixture(data);
        toast({
          title: "Success",
          description: "Fixture created successfully",
        });
      }
      
      onFixtureSaved();
      onClose();
    } catch (error) {
      console.error('Error saving fixture:', error);
      toast({
        title: "Error",
        description: "Failed to save fixture",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Fixture' : 'Add New Fixture'}
          </DialogTitle>
        </DialogHeader>
        
        <FixtureForm
          fixture={fixture}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FixtureDialog;
