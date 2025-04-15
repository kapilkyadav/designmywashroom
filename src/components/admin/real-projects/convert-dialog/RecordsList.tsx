
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
import { AlertCircle } from 'lucide-react';

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
  searchTerm,
  setSearchTerm,
  activeTab,
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

  if (records.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No convertible records found</h3>
        <p className="text-muted-foreground">
          There are no leads or project estimates available to convert. 
          Try creating a new lead first or create a project directly.
        </p>
      </div>
    );
  }

  return (
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
  );
};

export default RecordsList;
