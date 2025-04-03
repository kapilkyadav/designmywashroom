
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
import ProjectCreateWizard from '@/components/admin/real-projects/creation/ProjectCreateWizard';
import { ConvertibleRecord } from '@/services/RealProjectService';

interface ConvertRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

const ConvertRecordDialog: React.FC<ConvertRecordDialogProps> = ({ 
  open, 
  onOpenChange,
  onProjectCreated
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Create an empty convertible record for direct project creation
  // (when not converting from an existing lead or estimate)
  const emptyRecord: ConvertibleRecord = {
    record_type: "direct",
    record_id: "",
    client_name: "",
    client_email: "",
    client_mobile: "",
    client_location: "",
    created_date: new Date().toISOString(),
    status: "In Progress",
    real_project_id: null
  };

  // This will be called when the project creation is completed
  const handleProjectCreated = () => {
    setIsLoading(false);
    onProjectCreated();
    onOpenChange(false);
  };

  // If the user cancels the conversion
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new project
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Creating project...</span>
          </div>
        ) : (
          <ProjectCreateWizard 
            recordToConvert={emptyRecord}
            onComplete={handleProjectCreated}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConvertRecordDialog;
