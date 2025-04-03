
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
import { Loader2, BriefcaseBusiness, UserRound, Search, X } from 'lucide-react';
import { ConvertibleRecord, RealProjectService } from '@/services/RealProjectService';
import { useQuery } from '@tanstack/react-query';
import ProjectCreateWizard from './creation/ProjectCreateWizard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
  const [searchQuery, setSearchQuery] = useState('');
  
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
      setSearchQuery('');
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
      return <UserRound className="h-5 w-5 mr-2 text-blue-500" />;
    }
    return <BriefcaseBusiness className="h-5 w-5 mr-2 text-green-500" />;
  };
  
  // Filter records based on search query
  const filteredRecords = searchQuery.trim() === '' ? 
    records : 
    records.filter(record => 
      record.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.record_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Unknown Date';
    }
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
            
            <div className="relative my-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by client name or record type..."
                className="pl-8 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  className="absolute right-2 top-2 h-5 w-5 p-0" 
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <Separator className="my-4" />
            
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery.trim() !== '' ? 
                    'No records match your search.' : 
                    'No convertible records found.'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    refetch();
                  }}
                >
                  {searchQuery.trim() !== '' ? 'Clear Search' : 'Refresh'}
                </Button>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredRecords.map(record => (
                  <Button 
                    key={record.record_id}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 hover:bg-muted"
                    onClick={() => handleRecordSelect(record)}
                  >
                    <div className="flex items-start w-full">
                      <div className="flex items-center mr-3">
                        {getRecordTypeIcon(record.record_type)}
                      </div>
                      <div className="text-left flex-grow">
                        <div className="flex justify-between items-center w-full">
                          <div className="font-medium truncate max-w-[240px]">
                            {record.client_name}
                          </div>
                          <Badge 
                            className={record.record_type === 'lead' ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                          >
                            {record.record_type === 'lead' ? 'Lead' : 'Estimate'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span>Created: {formatDate(record.created_date)}</span>
                          {record.status && <span className="mx-2">•</span>}
                          {record.status && <span>Status: {record.status}</span>}
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
