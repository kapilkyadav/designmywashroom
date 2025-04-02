
import React from 'react';
import { Lead } from '@/services/LeadService';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import LeadDetailsDialog from './LeadDetailsDialog';
import { useLeadsTable } from './hooks/useLeadsTable';

// Import sub-components
import StatusCell from './table/StatusCell';
import FollowupCell from './table/FollowupCell';
import ContactCell from './table/ContactCell';
import ActionsCell from './table/ActionsCell';
import TableHeaderComponent from './table/TableHeader';
import PaginationComponent from './table/Pagination';
import DeleteConfirmDialog from './table/DeleteConfirmDialog';

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
  const {
    selectedLead,
    isDeleteDialogOpen,
    isDetailsDialogOpen,
    leadToDelete,
    isUpdating,
    handleDelete,
    confirmDelete,
    viewLeadDetails,
    handleStatusChange,
    scheduleFollowUp,
    getBudgetDisplay,
    setIsDeleteDialogOpen,
    setIsDetailsDialogOpen
  } = useLeadsTable(onRefresh);

  // Handle refresh after any dialog operation
  const handleDialogOperationComplete = () => {
    // Ensure DOM is ready for interaction
    document.body.style.overflow = 'auto';
    document.body.classList.remove('no-scroll', 'overflow-hidden');
    
    // Use setTimeout to ensure this runs after dialog animations complete
    setTimeout(() => {
      onRefresh();
    }, 350);
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeaderComponent
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
          />
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
                    <ContactCell phone={lead.phone} email={lead.email} />
                  </TableCell>
                  <TableCell>{lead.location || '—'}</TableCell>
                  <TableCell>{getBudgetDisplay(lead.budget_preference)}</TableCell>
                  <TableCell>
                    <StatusCell
                      status={lead.status}
                      leadId={lead.id}
                      onStatusChange={handleStatusChange}
                      isUpdating={isUpdating === lead.id}
                    />
                  </TableCell>
                  <TableCell>
                    <FollowupCell
                      followupDate={lead.next_followup_date}
                      leadId={lead.id}
                      onScheduleFollowup={scheduleFollowUp}
                      isUpdating={isUpdating === lead.id}
                    />
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
                    <ActionsCell
                      lead={lead}
                      onDelete={confirmDelete}
                      onViewDetails={viewLeadDetails}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <PaginationComponent
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
      
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        leadToDelete={leadToDelete}
        onConfirmDelete={handleDelete}
      />
      
      {selectedLead && (
        <LeadDetailsDialog 
          lead={selectedLead} 
          open={isDetailsDialogOpen} 
          onOpenChange={setIsDetailsDialogOpen}
          onUpdate={handleDialogOperationComplete}
        />
      )}
    </div>
  );
};

export default LeadsTable;
