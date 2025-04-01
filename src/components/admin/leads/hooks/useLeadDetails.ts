
import { useState, useEffect } from 'react';
import { Lead, LeadService, LeadActivityLog, LeadRemark } from '@/services/LeadService';

export const useLeadDetails = (leadId: string, isOpen: boolean) => {
  const [activityLogs, setActivityLogs] = useState<LeadActivityLog[]>([]);
  const [remarks, setRemarks] = useState<LeadRemark[]>([]);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
  const [isLoadingLead, setIsLoadingLead] = useState(false);

  const fetchActivityLogs = async () => {
    if (!isOpen) return; // Don't fetch if dialog is closed
    
    setIsLoadingLogs(true);
    try {
      const logs = await LeadService.getActivityLogs(leadId);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };
  
  const fetchRemarks = async () => {
    if (!isOpen) return; // Don't fetch if dialog is closed
    
    setIsLoadingRemarks(true);
    try {
      const remarkData = await LeadService.getRemarks(leadId);
      setRemarks(remarkData);
    } catch (error) {
      console.error('Error fetching remarks:', error);
    } finally {
      setIsLoadingRemarks(false);
    }
  };

  const fetchLeadDetails = async () => {
    if (!isOpen) return; // Don't fetch if dialog is closed
    
    setIsLoadingLead(true);
    try {
      const leadData = await LeadService.getLead(leadId);
      if (leadData) {
        setLead(leadData);
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
    } finally {
      setIsLoadingLead(false);
    }
  };

  // Fetch data when dialog is opened or lead ID changes
  useEffect(() => {
    if (isOpen && leadId) {
      fetchActivityLogs();
      fetchRemarks();
      fetchLeadDetails();
    }
  }, [isOpen, leadId]);

  return {
    activityLogs,
    remarks,
    lead,
    isLoadingLogs,
    isLoadingRemarks,
    isLoadingLead,
    refreshRemarks: fetchRemarks,
    refreshLogs: fetchActivityLogs,
    refreshLead: fetchLeadDetails
  };
};
