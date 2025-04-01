
import React from 'react';
import { TableHead, TableHeader as UITableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface TableHeaderProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  sortBy,
  sortDirection,
  onSortChange
}) => {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <UITableHeader>
      <TableRow>
        <TableHead 
          onClick={() => onSortChange('lead_date')} 
          className="cursor-pointer"
        >
          <div className="flex items-center">
            Date {getSortIcon('lead_date')}
          </div>
        </TableHead>
        <TableHead 
          onClick={() => onSortChange('customer_name')}
          className="cursor-pointer"
        >
          <div className="flex items-center">
            Customer Name {getSortIcon('customer_name')}
          </div>
        </TableHead>
        <TableHead>Contact</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Budget</TableHead>
        <TableHead 
          onClick={() => onSortChange('status')} 
          className="cursor-pointer"
        >
          <div className="flex items-center">
            Status {getSortIcon('status')}
          </div>
        </TableHead>
        <TableHead
          onClick={() => onSortChange('next_followup_date')}
          className="cursor-pointer"
        >
          <div className="flex items-center">
            Follow-up {getSortIcon('next_followup_date')}
          </div>
        </TableHead>
        <TableHead>Latest Remark</TableHead>
        <TableHead className="w-[100px]">Actions</TableHead>
      </TableRow>
    </UITableHeader>
  );
};

export default TableHeader;
