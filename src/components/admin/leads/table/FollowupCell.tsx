
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, isToday, isYesterday, isPast } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

interface FollowupCellProps {
  followupDate: string | null;
  leadId: string;
  onScheduleFollowup: (leadId: string, days: number) => Promise<void>;
  isUpdating: boolean;
}

const FollowupCell: React.FC<FollowupCellProps> = ({
  followupDate,
  leadId,
  onScheduleFollowup,
  isUpdating
}) => {
  const getFollowUpBadge = (date: string | null) => {
    if (!date) return null;
    
    const followUpDate = new Date(date);
    
    if (isPast(followUpDate) && !isToday(followUpDate)) {
      return (
        <Badge variant="destructive" className="flex gap-1 items-center">
          <Clock className="h-3 w-3" /> Overdue
        </Badge>
      );
    }
    
    if (isToday(followUpDate)) {
      return (
        <Badge variant="default" className="flex gap-1 items-center bg-amber-500">
          <Clock className="h-3 w-3" /> Today
        </Badge>
      );
    }
    
    if (isYesterday(followUpDate)) {
      return (
        <Badge variant="destructive" className="flex gap-1 items-center">
          <Clock className="h-3 w-3" /> Yesterday
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex gap-1 items-center">
        <Calendar className="h-3 w-3" /> {format(followUpDate, 'dd MMM')}
      </Badge>
    );
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
                  {getFollowUpBadge(followupDate) || (
                    <Badge variant="outline" className="flex gap-1 items-center">
                      <Calendar className="h-3 w-3" /> Schedule
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Set Follow-up</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onScheduleFollowup(leadId, 1)}>
                  Tomorrow
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onScheduleFollowup(leadId, 3)}>
                  In 3 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onScheduleFollowup(leadId, 7)}>
                  In a week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onScheduleFollowup(leadId, 14)}>
                  In 2 weeks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to schedule follow-up</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FollowupCell;
