
import React, { useState } from 'react';
import { Lead } from '@/services/leads/types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  MoreHorizontal, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import ConvertLeadDialog from '../ConvertLeadDialog';
import { useToast } from '@/hooks/use-toast';

interface ActionsCellProps {
  lead: Lead;
  onDelete: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
  onRefresh?: () => void;
}

const ActionsCell: React.FC<ActionsCellProps> = ({ 
  lead, 
  onDelete, 
  onViewDetails,
  onRefresh
}) => {
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleConversionComplete = () => {
    toast({
      title: "Lead converted to project",
      description: "The lead has been successfully converted to a project."
    });
    
    // Refresh parent data if refresh callback is provided
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onViewDetails(lead)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsConvertDialogOpen(true)}
            disabled={lead.status === 'Converted'}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Convert to Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(lead)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConvertLeadDialog
        lead={lead}
        open={isConvertDialogOpen}
        onOpenChange={setIsConvertDialogOpen}
        onConversionComplete={handleConversionComplete}
      />
    </>
  );
};

export default ActionsCell;
