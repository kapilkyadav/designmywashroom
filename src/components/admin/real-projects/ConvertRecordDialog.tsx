
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProjectCreateWizard from '@/components/admin/real-projects/creation/ProjectCreateWizard';
import { ConvertibleRecord, RealProjectService } from '@/services/RealProjectService';
import RecordsList from '@/components/admin/real-projects/convert-dialog/RecordsList';
import LoadingIndicator from '@/components/admin/real-projects/convert-dialog/LoadingIndicator';

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
  const [records, setRecords] = useState<ConvertibleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
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

  // Fetch convertible records when dialog opens
  useEffect(() => {
    if (open) {
      fetchRecords();
    } else {
      // Reset state when dialog closes
      setSelectedRecord(null);
      setShowWizard(false);
    }
  }, [open]);

  // Fetch records from API
  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await RealProjectService.getConvertibleRecords();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching convertible records:", error);
    } finally {
      setIsLoading(false);
    }
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
    setIsLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        {isLoading ? (
          <LoadingIndicator />
        ) : showWizard && selectedRecord ? (
          <ProjectCreateWizard 
            recordToConvert={selectedRecord}
            onComplete={handleProjectCreated}
            onCancel={handleCancel}
          />
        ) : (
          <RecordsList
            records={records}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSelectRecord={handleSelectRecord}
            onCreateDirect={handleCreateDirect}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConvertRecordDialog;
