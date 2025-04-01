
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { Lead } from '@/services/LeadService';

interface ActionsCellProps {
  lead: Lead;
  onDelete: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
}

const ActionsCell: React.FC<ActionsCellProps> = ({
  lead,
  onDelete,
  onViewDetails
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-background">
        <DropdownMenuItem 
          onClick={() => onViewDetails(lead)}
          className="cursor-pointer"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(lead);
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionsCell;
