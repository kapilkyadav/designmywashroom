
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Lead } from '@/services/leads/types';
import ProjectCreateWizard from '@/components/admin/real-projects/creation/ProjectCreateWizard';

interface ConvertLeadDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversionComplete: () => void;
}

const ConvertLeadDialog: React.FC<ConvertLeadDialogProps> = ({ 
  lead, 
  open, 
  onOpenChange,
  onConversionComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // This will be called when the project creation is completed
  const handleProjectCreated = () => {
    setIsLoading(false);
    onConversionComplete();
    onOpenChange(false);
  };

  // If the user cancels the conversion
  const handleCancel = () => {
    onOpenChange(false);
  };

  // Create a convertible record object from the lead
  // Explicitly type record_type as "lead" to match the ConvertibleRecord type
  const convertibleRecord = {
    record_type: "lead" as const, // Using const assertion instead of type assertion for better type safety
    record_id: lead.id,
    client_name: lead.customer_name,
    created_date: lead.created_at,
    status: lead.status,
    real_project_id: null
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Lead to Project</DialogTitle>
          <DialogDescription>
            Create a new project from this lead's information
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Converting lead to project...</span>
          </div>
        ) : (
          <ProjectCreateWizard 
            recordToConvert={convertibleRecord}
            onComplete={handleProjectCreated}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConvertLeadDialog;
