
import React from 'react';
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
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { LeadService } from '@/services/LeadService';
import { format } from 'date-fns';
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
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'New':
        return <Badge variant="default">New</Badge>;
      case 'Contacted':
        return <Badge variant="secondary">Contacted</Badge>;
      case 'Qualified':
        return <Badge variant="success" className="bg-green-600">Qualified</Badge>;
      case 'Lost':
        return <Badge variant="destructive">Lost</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(startRecord + pageSize - 1, totalCount);
  
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
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
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
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
                      <span>{lead.phone}</span>
                      {lead.email && <span className="text-xs text-muted-foreground">{lead.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell>{lead.location || '—'}</TableCell>
                  <TableCell>{lead.budget_preference || '—'}</TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
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
