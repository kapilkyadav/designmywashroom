
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Washroom } from '@/services/real-projects/types';
import WashroomLayoutDesigner from './WashroomLayoutDesigner';
import { RealProjectService } from '@/services/real-projects';

interface LayoutDesignerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  washroom: Washroom;
  projectId: string;
  onLayoutSaved: () => void;
}

const LayoutDesignerDialog: React.FC<LayoutDesignerDialogProps> = ({
  isOpen,
  onClose,
  washroom,
  projectId,
  onLayoutSaved
}) => {
  const handleSaveLayout = async (layoutData: any) => {
    try {
      // Save layout data to the washroom service details
      const updatedWashroom = { 
        ...washroom,
        service_details: {
          ...washroom.service_details,
          layout: layoutData
        }
      };
      
      // Get all washrooms from the project
      const washrooms = await RealProjectService.getProjectWashrooms(projectId);
      
      // Find and update the target washroom
      const updatedWashrooms = washrooms.map(w => 
        w.id === washroom.id ? updatedWashroom : w
      );
      
      // Save the updated washrooms
      await RealProjectService.updateProjectWashrooms(projectId, updatedWashrooms);
      onLayoutSaved();
    } catch (error) {
      console.error("Error saving layout:", error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Layout Designer - {washroom.name}</DialogTitle>
          <DialogDescription>
            Design the washroom layout by adding fixtures and other elements
          </DialogDescription>
        </DialogHeader>
        
        <WashroomLayoutDesigner 
          washroom={washroom} 
          onSave={handleSaveLayout}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LayoutDesignerDialog;
