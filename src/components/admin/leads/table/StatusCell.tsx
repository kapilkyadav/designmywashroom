
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatusCellProps {
  status: string;
  leadId: string;
  onStatusChange: (leadId: string, status: string) => Promise<void>;
  isUpdating: boolean;
}

const StatusCell: React.FC<StatusCellProps> = ({
  status,
  leadId,
  onStatusChange,
  isUpdating
}) => {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'New':
        return <Badge variant="default">New</Badge>;
      case 'Contacted':
        return <Badge variant="secondary">Contacted</Badge>;
      case 'Qualified':
        return <Badge className="bg-green-600 text-white">Qualified</Badge>;
      case 'Lost':
        return <Badge variant="destructive">Lost</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 py-0" 
                  disabled={isUpdating}
                >
                  {getStatusBadge(status)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup 
                  value={status} 
                  onValueChange={(value) => onStatusChange(leadId, value)}
                >
                  <DropdownMenuRadioItem value="New">
                    New
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Contacted">
                    Contacted
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Qualified">
                    Qualified
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Lost">
                    Lost
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to change status</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatusCell;
