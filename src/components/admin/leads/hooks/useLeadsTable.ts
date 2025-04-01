
import { useState } from 'react';
import { Lead, LeadService } from '@/services/LeadService';
import { useToast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';
import { format } from 'date-fns';

export const useLeadsTable = (onRefresh: () => void) => {
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
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
  
  const getBudgetDisplay = (budget: string | null) => {
    if (!budget || budget === 'not_specified') return '—';
    return budget;
  };
  
  const handleDetailsDialogClose = () => {
    setIsDetailsDialogOpen(false);
    // Reset selected lead after animation completes
    setTimeout(() => {
      setSelectedLead(null);
    }, 300);
  };

  return {
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
    setIsDetailsDialogOpen: handleDetailsDialogClose
  };
};
