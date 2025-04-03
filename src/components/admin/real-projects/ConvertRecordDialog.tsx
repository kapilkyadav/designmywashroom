
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
import { Loader2, BriefcaseBusiness, UserRound, Search, X, Filter, CalendarDays } from 'lucide-react';
import { ConvertibleRecord, RealProjectService } from '@/services/RealProjectService';
import { useQuery } from '@tanstack/react-query';
import ProjectCreateWizard from './creation/ProjectCreateWizard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

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
  const [recordTypeFilter, setRecordTypeFilter] = useState<string | undefined>(undefined);
  
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
      setRecordTypeFilter(undefined);
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
  
  const getRecordTypeBadge = (type: string) => {
    if (type === 'lead') {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          Lead
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 border-green-300">
        Project Estimate
      </Badge>
    );
  };
  
  // Filter records based on search query and type filter
  const filteredRecords = records
    .filter(record => {
      // Apply type filter if selected
      if (recordTypeFilter && record.record_type !== recordTypeFilter) {
        return false;
      }
      
      // Apply search query if entered
      if (searchQuery.trim() === '') {
        return true;
      }
      
      return record.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             record.record_type.toLowerCase().includes(searchQuery.toLowerCase());
    });

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
            
            <div className="space-y-4 my-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by client name..."
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
                
                <Select
                  value={recordTypeFilter || ""}
                  onValueChange={(value) => setRecordTypeFilter(value || undefined)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All record types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All record types</SelectItem>
                    <SelectItem value="lead">Leads only</SelectItem>
                    <SelectItem value="estimate">Estimates only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'} found
                </p>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground"
                  onClick={() => {
                    setSearchQuery('');
                    setRecordTypeFilter(undefined);
                    refetch();
                  }}
                >
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  Clear filters
                </Button>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery.trim() !== '' || recordTypeFilter ? 
                    'No records match your search.' : 
                    'No convertible records found.'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setRecordTypeFilter(undefined);
                    refetch();
                  }}
                >
                  {searchQuery.trim() !== '' || recordTypeFilter ? 'Clear Filters' : 'Refresh'}
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
                    <div className="flex flex-col sm:flex-row sm:items-center w-full gap-2">
                      <div className="flex items-center">
                        {getRecordTypeIcon(record.record_type)}
                      </div>
                      
                      <div className="text-left flex-grow space-y-1">
                        <div className="font-medium truncate max-w-[240px]">
                          {record.client_name || "Unnamed Client"}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <CalendarDays className="h-3 w-3 mr-1" />
                            {formatDate(record.created_date)}
                          </div>
                          
                          {record.status && (
                            <span className="px-1.5 py-0.5 rounded bg-muted">
                              {record.status}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="sm:ml-2 mt-2 sm:mt-0">
                        {getRecordTypeBadge(record.record_type)}
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
