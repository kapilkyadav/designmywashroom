
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProjectCreateWizard from '@/components/admin/real-projects/creation/ProjectCreateWizard';
import { ConvertibleRecord } from '@/services/RealProjectService';
import RecordsListView from './RecordsListView';

interface ConvertDialogContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

const ConvertDialogContainer: React.FC<ConvertDialogContainerProps> = ({ 
  open, 
  onOpenChange,
  onProjectCreated
}) => {
  const [selectedRecord, setSelectedRecord] = useState<ConvertibleRecord | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Create an empty convertible record for direct project creation
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

  // Handle record selection
  const handleSelectRecord = (record: ConvertibleRecord) => {
    setSelectedRecord(record);
    setShowWizard(true);
  };

  // Handle create new project directly
  const handleCreateDirect = () => {
    setSelectedRecord(emptyRecord);
    setShowWizard(true);
  };

  // This will be called when the project creation is completed
  const handleProjectCreated = () => {
    onProjectCreated();
    onOpenChange(false);
  };

  // If the user cancels the conversion
  const handleCancel = () => {
    if (showWizard) {
      setShowWizard(false);
      setSelectedRecord(null);
    } else {
      onOpenChange(false);
    }
  };

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSelectedRecord(null);
      setShowWizard(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showWizard ? 'Create New Project' : 'Select Record to Convert'}
          </DialogTitle>
          <DialogDescription>
            {showWizard 
              ? 'Fill in the details to create a new project' 
              : 'Select a lead or estimate to convert, or create a new project directly'}
          </DialogDescription>
        </DialogHeader>

        {showWizard && selectedRecord ? (
          <WizardView 
            recordToConvert={selectedRecord}
            onComplete={handleProjectCreated}
            onCancel={handleCancel}
          />
        ) : (
          <RecordsListView
            onSelectRecord={handleSelectRecord}
            onCreateDirect={handleCreateDirect}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

// Wizard view component
const WizardView: React.FC<{
  recordToConvert: ConvertibleRecord;
  onComplete: () => void;
  onCancel: () => void;
}> = ({ recordToConvert, onComplete, onCancel }) => {
  return (
    <ProjectCreateWizard 
      recordToConvert={recordToConvert}
      onComplete={onComplete}
      onCancel={onCancel}
    />
  );
};

export default ConvertDialogContainer;
