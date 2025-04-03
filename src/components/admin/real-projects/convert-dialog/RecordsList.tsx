
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
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={`${record.record_type}-${record.record_id}`}>
                <TableCell>
                  <Badge variant={record.record_type === 'lead' ? 'default' : 'secondary'}>
                    {record.record_type === 'lead' ? 'Lead' : 'Estimate'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{record.client_name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm">{record.client_mobile}</p>
                    {record.client_email && (
                      <p className="text-xs text-muted-foreground">{record.client_email}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(record.created_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => onSelectRecord(record)}>
                    Select
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordsList;
