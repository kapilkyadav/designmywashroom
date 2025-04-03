
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, BriefcaseBusiness, UserRound } from 'lucide-react';
import { ConvertibleRecord, RealProjectService } from '@/services/RealProjectService';
import { useQuery } from '@tanstack/react-query';
import ProjectCreateWizard from './creation/ProjectCreateWizard';

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
  const [selectedRecord, setSelectedRecord] = useState<ConvertibleRecord | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  
  const { 
    data: records = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['convertible-records'],
    queryFn: RealProjectService.getConvertibleRecords,
    enabled: open && !showWizard,
  });
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedRecord(null);
      setShowWizard(false);
    }
  }, [open]);
  
  const handleRecordSelect = (record: ConvertibleRecord) => {
    setSelectedRecord(record);
    setShowWizard(true);
  };
  
  const handleWizardComplete = () => {
    onProjectCreated();
    onOpenChange(false);
  };
  
  const handleWizardCancel = () => {
    setShowWizard(false);
    setSelectedRecord(null);
  };
  
  const getRecordTypeIcon = (type: string) => {
    if (type === 'lead') {
      return <UserRound className="h-5 w-5 mr-2" />;
    }
    return <BriefcaseBusiness className="h-5 w-5 mr-2" />;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!showWizard ? (
          <>
            <DialogHeader>
              <DialogTitle>Convert to Real Project</DialogTitle>
              <DialogDescription>
                Select a lead or project estimate to convert into a real project.
              </DialogDescription>
            </DialogHeader>
            
            <Separator className="my-4" />
            
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No convertible records found.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => refetch()}
                >
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="grid gap-2">
                {records.map(record => (
                  <Button 
                    key={record.record_id}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => handleRecordSelect(record)}
                  >
                    <div className="flex items-start">
                      <div className="flex items-center">
                        {getRecordTypeIcon(record.record_type)}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">
                          {record.client_name}
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
                            {record.record_type === 'lead' ? 'Lead' : 'Estimate'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created: {new Date(record.created_date).toLocaleDateString()}
                          {record.status && ` • Status: ${record.status}`}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </>
        ) : (
          <ProjectCreateWizard 
            recordToConvert={selectedRecord}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConvertRecordDialog;
