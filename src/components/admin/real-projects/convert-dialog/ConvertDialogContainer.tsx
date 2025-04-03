
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { RealProjectService, ConvertibleRecord } from '@/services/real-projects/types';
import RecordsList from './RecordsList';

interface ConvertDialogContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

const ConvertDialogContainer: React.FC<ConvertDialogContainerProps> = ({
  open,
  onOpenChange,
  onProjectCreated,
}) => {
  const [records, setRecords] = useState<ConvertibleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<ConvertibleRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Fetch records when the dialog opens
  useEffect(() => {
    const fetchRecords = async () => {
      if (!open) return;
      
      setIsLoading(true);
      try {
        const fetchedRecords = await RealProjectService.getConvertibleRecords();
        setRecords(fetchedRecords);
      } catch (error: any) {
        console.error("Error fetching records:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch records.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [open]);

  const handleSelectRecord = (record: ConvertibleRecord) => {
    setSelectedRecord(record);
  };

  const handleCreateDirect = () => {
    // Go to project creation without a record to convert
    onOpenChange(false);
    onProjectCreated();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        // Reset state when closing the dialog
        setSearchTerm('');
        setActiveTab('all');
        setSelectedRecord(null);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Record to Project</DialogTitle>
          <DialogDescription>
            Select a lead or project estimate to convert to a real project.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading records...</span>
          </div>
        ) : selectedRecord ? (
          <div className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/30">
              <h4 className="text-sm font-medium mb-2">Selected Record</h4>
              <p className="text-sm">Client Name: {selectedRecord.client_name}</p>
              <p className="text-sm">Client Email: {selectedRecord.client_email || 'N/A'}</p>
              <p className="text-sm">Client Mobile: {selectedRecord.client_mobile}</p>
              <p className="text-sm">Type: {selectedRecord.record_type.replace('_', ' ')}</p>
              <p className="text-sm">Created Date: {new Date(selectedRecord.created_date).toLocaleDateString()}</p>
              
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  onClick={() => setSelectedRecord(null)}
                >
                  Back to List
                </button>
                <button
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm"
                  onClick={() => {
                    onOpenChange(false);
                    onProjectCreated();
                  }}
                  disabled={isConverting}
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    "Convert to Project"
                  )}
                </button>
              </div>
            </div>
          </div>
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

export default ConvertDialogContainer;
