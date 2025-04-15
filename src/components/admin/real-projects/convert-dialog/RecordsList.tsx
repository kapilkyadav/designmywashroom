
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ConvertibleRecord } from '@/services/real-projects/types';
import { Button } from '@/components/ui/button';
import { AlertCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RecordsListProps {
  records: ConvertibleRecord[];
  isLoading: boolean;
  onSelectRecord: (record: ConvertibleRecord) => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onCreateDirect?: () => void;
  onCancel?: () => void;
}

const RecordsList: React.FC<RecordsListProps> = ({ 
  records, 
  isLoading, 
  onSelectRecord,
  searchTerm = '',
  setSearchTerm,
  activeTab = 'all',
  setActiveTab,
  onCreateDirect,
  onCancel
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      {setSearchTerm && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email or phone..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Tabs for filtering */}
      {setActiveTab && (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Records</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {records.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No convertible records found</h3>
          <p className="text-muted-foreground">
            There are no leads or project estimates available to convert. 
            Try creating a new lead first or create a project directly.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>Cancel</Button>
            )}
            {onCreateDirect && (
              <Button onClick={onCreateDirect}>Create Project Directly</Button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative overflow-x-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={`${record.record_type}-${record.record_id}`}>
                  <TableCell>
                    <Badge variant={record.record_type === 'lead' ? 'default' : 'secondary'}>
                      {record.record_type === 'lead' ? 'Lead' : 'Estimate'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{record.client_name || 'Unnamed'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{record.client_mobile || 'No phone'}</p>
                      {record.client_email && (
                        <p className="text-xs text-muted-foreground">{record.client_email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {record.created_date ? 
                      format(new Date(record.created_date), 'dd/MM/yyyy') : 
                      'Unknown date'}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => onSelectRecord(record)}>
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RecordsList;
