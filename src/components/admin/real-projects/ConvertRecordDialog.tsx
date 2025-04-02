
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RealProjectService, ConvertibleRecord } from '@/services/RealProjectService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search } from 'lucide-react';
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'leads' | 'estimates'>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ConvertibleRecord | null>(null);
  
  const { data: records, isLoading, refetch } = useQuery({
    queryKey: ['convertible-records'],
    queryFn: () => RealProjectService.getConvertibleRecords(),
    enabled: open
  });
  
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);
  
  const filteredRecords = records?.filter(record => {
    if (!searchQuery) return true;
    
    const lowerQuery = searchQuery.toLowerCase();
    return record.client_name.toLowerCase().includes(lowerQuery);
  });
  
  const leadsRecords = filteredRecords?.filter(record => record.record_type === 'lead') || [];
  const estimateRecords = filteredRecords?.filter(record => record.record_type === 'project_estimate') || [];
  
  const handleSelectRecord = (record: ConvertibleRecord) => {
    setSelectedRecord(record === selectedRecord ? null : record);
  };
  
  const handleConvert = async () => {
    if (!selectedRecord) return;
    
    try {
      setIsConverting(true);
      
      let result;
      if (selectedRecord.record_type === 'lead') {
        result = await RealProjectService.convertLeadToRealProject(selectedRecord.record_id);
      } else {
        result = await RealProjectService.convertEstimateToRealProject(selectedRecord.record_id);
      }
      
      if (result.success && result.project) {
        onProjectCreated();
        navigate(`/admin/real-projects/${result.project.id}`);
      }
    } finally {
      setIsConverting(false);
    }
  };
  
  const renderTabContent = (records: ConvertibleRecord[]) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    if (!records.length) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          No records found to convert
        </div>
      );
    }
    
    return (
      <div className="max-h-[400px] overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow 
                key={record.record_id}
                className={`cursor-pointer hover:bg-muted/50 ${selectedRecord?.record_id === record.record_id ? 'bg-muted' : ''}`}
                onClick={() => handleSelectRecord(record)}
              >
                <TableCell className="font-medium">
                  {record.client_name}
                </TableCell>
                <TableCell>
                  {format(new Date(record.created_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  {record.status ? (
                    <Badge variant="outline">{record.status}</Badge>
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Convert to Real Project</DialogTitle>
          <DialogDescription>
            Select a lead or project estimate to convert into a real project. 
            This will copy all relevant information to create a new project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'leads' | 'estimates')}>
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="leads" className="flex-1">
                Leads {leadsRecords.length > 0 && `(${leadsRecords.length})`}
              </TabsTrigger>
              <TabsTrigger value="estimates" className="flex-1">
                Estimates {estimateRecords.length > 0 && `(${estimateRecords.length})`}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="leads">
              {renderTabContent(leadsRecords)}
            </TabsContent>
            
            <TabsContent value="estimates">
              {renderTabContent(estimateRecords)}
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            disabled={!selectedRecord || isConverting} 
            onClick={handleConvert}
          >
            {isConverting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isConverting 
              ? 'Converting...' 
              : selectedRecord 
                ? `Convert ${selectedRecord.record_type === 'lead' ? 'Lead' : 'Estimate'}`
                : 'Select a Record'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertRecordDialog;
