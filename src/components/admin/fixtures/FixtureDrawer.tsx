
import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Fixture } from '@/lib/supabase';
import { FixtureService } from '@/services/FixtureService';
import { toast } from '@/hooks/use-toast';
import FixtureForm from './FixtureForm';

interface FixtureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fixture?: Fixture;
  onFixtureSaved: () => void;
}

const FixtureDrawer: React.FC<FixtureDrawerProps> = ({
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
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="px-4 pb-6">
        <DrawerHeader className="pb-2">
          <DrawerTitle>
            {isEditMode ? 'Edit Fixture' : 'Add New Fixture'}
          </DrawerTitle>
        </DrawerHeader>
        
        <FixtureForm
          fixture={fixture}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default FixtureDrawer;
