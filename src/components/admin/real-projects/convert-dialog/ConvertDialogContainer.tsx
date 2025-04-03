
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConvertibleRecord } from '@/services/real-projects/types';
import { RealProjectService } from '@/services/RealProjectService';
import { useQuery } from '@tanstack/react-query';
import RecordsListView from './RecordsListView';
import LoadingIndicator from './LoadingIndicator';
import { toast } from '@/hooks/use-toast';

interface ConvertDialogContainerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ConvertDialogContainer: React.FC<ConvertDialogContainerProps> = ({ open, onClose, onSuccess }) => {
  const [selectedRecord, setSelectedRecord] = useState<ConvertibleRecord | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [recordType, setRecordType] = useState<'lead' | 'project_estimate'>('lead');
  
  // Fetch convertible records
  const { data: records = [], isLoading, refetch } = useQuery({
    queryKey: ['convertible-records'],
    queryFn: () => RealProjectService.getConvertibleRecords(),
    enabled: open,
  });
  
  const handleConvert = async () => {
    if (!selectedRecord) return;
    
    try {
      setIsConverting(true);
      
      // Additional data for the conversion
      const additionalData = {
        project_type: 'Remodeling',
        project_details: {
          address: '',
          floor_number: '',
          service_lift_available: false,
        },
      };
      
      await RealProjectService.convertToProject(selectedRecord, additionalData);
      
      toast({
        title: 'Conversion successful',
        description: 'The record has been converted to a real project.',
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Conversion failed',
        description: error.message || 'An error occurred during conversion.',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Convert to Real Project</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <LoadingIndicator message="Loading convertible records..." />
        ) : (
          <RecordsListView
            selectedRecord={selectedRecord}
            recordType={recordType}
            onSelectRecord={setSelectedRecord}
            onChangeRecordType={setRecordType as (type: string) => void}
          />
        )}
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isConverting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConvert} 
            disabled={!selectedRecord || isConverting}
          >
            {isConverting ? 'Converting...' : 'Convert to Project'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertDialogContainer;
