import React, { useState } from 'react';
import { Lead } from '@/services/LeadService';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  PhoneCall,
  Mail,
  Clock,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { LeadService } from '@/services/LeadService';
import { format, isToday, isYesterday, isPast, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import LeadDetailsDialog from './LeadDetailsDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface LeadsTableProps {
  leads: Lead[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onSortChange: (field: string) => void;
  onRefresh: () => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  totalCount,
  currentPage,
  pageSize,
  sortBy,
  sortDirection,
  onPageChange,
  onSortChange,
  onRefresh
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState<boolean>(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState<boolean>(false);
  const [leadToDelete, setLeadToDelete] = React.useState<Lead | null>(null);
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);
  
  const handleDelete = async () => {
    if (!leadToDelete) return;
    
    try {
      const result = await LeadService.deleteLead(leadToDelete.id);
      if (result) {
        toast({
          title: "Lead deleted",
          description: "The lead has been successfully deleted.",
        });
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };
  
  const confirmDelete = (lead: Lead) => {
    setLeadToDelete(lead);
    setIsDeleteDialogOpen(true);
  };
  
  const viewLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsDialogOpen(true);
  };
  
  const handleStatusChange = async (leadId: string, status: string) => {
    setIsUpdating(leadId);
    try {
      const result = await LeadService.updateLead(leadId, { status });
      if (result) {
        toast({
          title: "Status updated",
          description: `Lead status changed to ${status}`,
        });
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };
  
  const scheduleFollowUp = async (leadId: string, days: number) => {
    setIsUpdating(leadId);
    const followupDate = addDays(new Date(), days);
    
    try {
      const result = await LeadService.updateLead(leadId, { 
        next_followup_date: followupDate.toISOString() 
      });
      
      if (result) {
        toast({
          title: "Follow-up scheduled",
          description: `Follow-up set for ${format(followupDate, 'dd MMM yyyy')}`,
        });
        onRefresh();
      }
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      toast({
        title: "Error",
        description: "Failed to schedule follow-up",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };
  
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

  const getBudgetDisplay = (budget: string | null) => {
    if (!budget || budget === 'not_specified') return '—';
    return budget;
  };
  
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(startRecord + pageSize - 1, totalCount);
  
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };
  
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
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
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    {lead.lead_date ? format(new Date(lead.lead_date), 'dd/MM/yyyy') : '—'}
                  </TableCell>
                  <TableCell>{lead.customer_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <PhoneCall className="h-3 w-3 text-muted-foreground" />
                        <span>{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{lead.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{lead.location || '—'}</TableCell>
                  <TableCell>{getBudgetDisplay(lead.budget_preference)}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2 py-0">
                                  {getStatusBadge(lead.status)}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup 
                                  value={lead.status} 
                                  onValueChange={(value) => handleStatusChange(lead.id, value)}
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
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2 py-0">
                                  {getFollowUpBadge(lead.next_followup_date) || (
                                    <Badge variant="outline" className="flex gap-1 items-center">
                                      <Calendar className="h-3 w-3" /> Schedule
                                    </Badge>
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Set Follow-up</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => scheduleFollowUp(lead.id, 1)}>
                                  Tomorrow
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => scheduleFollowUp(lead.id, 3)}>
                                  In 3 days
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => scheduleFollowUp(lead.id, 7)}>
                                  In a week
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => scheduleFollowUp(lead.id, 14)}>
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
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm">
                      {lead.remarks ? (
                        <span className="text-sm">{lead.remarks}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No remarks</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewLeadDetails(lead)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => confirmDelete(lead)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {startRecord} to {endRecord} of {totalCount} entries
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0 mx-1"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lead for {leadToDelete?.customer_name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {selectedLead && isDetailsDialogOpen && (
        <LeadDetailsDialog 
          lead={selectedLead} 
          open={isDetailsDialogOpen} 
          onOpenChange={setIsDetailsDialogOpen} 
          onUpdate={onRefresh}
        />
      )}
    </div>
  );
};

export default LeadsTable;
