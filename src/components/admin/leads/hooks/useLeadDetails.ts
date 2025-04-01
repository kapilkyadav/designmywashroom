
import { useState, useEffect, useRef } from 'react';
import { Lead, LeadService, LeadActivityLog, LeadRemark } from '@/services/LeadService';

export const useLeadDetails = (leadId: string, isOpen: boolean) => {
  const [activityLogs, setActivityLogs] = useState<LeadActivityLog[]>([]);
  const [remarks, setRemarks] = useState<LeadRemark[]>([]);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const isMounted = useRef(true);

  // Set up cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchActivityLogs = async () => {
    if (!isOpen || !leadId) return; // Don't fetch if dialog is closed or no leadId
    
    setIsLoadingLogs(true);
    try {
      const logs = await LeadService.getActivityLogs(leadId);
      if (isMounted.current) {
        setActivityLogs(logs);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      if (isMounted.current) {
        setIsLoadingLogs(false);
      }
    }
  };
  
  const fetchRemarks = async () => {
    if (!isOpen || !leadId) return; // Don't fetch if dialog is closed or no leadId
    
    setIsLoadingRemarks(true);
    try {
      const remarkData = await LeadService.getRemarks(leadId);
      if (isMounted.current) {
        setRemarks(remarkData);
      }
    } catch (error) {
      console.error('Error fetching remarks:', error);
    } finally {
      if (isMounted.current) {
        setIsLoadingRemarks(false);
      }
    }
  };

  const fetchLeadDetails = async () => {
    if (!isOpen || !leadId) return; // Don't fetch if dialog is closed or no leadId
    
    setIsLoadingLead(true);
    try {
      const leadData = await LeadService.getLead(leadId);
      if (isMounted.current && leadData) {
        setLead(leadData);
      }
    } catch (error) {
      console.error('Error fetching lead details:', error);
    } finally {
      if (isMounted.current) {
        setIsLoadingLead(false);
      }
    }
  };

  // Reset states when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setActivityLogs([]);
      setRemarks([]);
      setLead(null);
      setIsLoadingLogs(false);
      setIsLoadingRemarks(false);
      setIsLoadingLead(false);
    }
  }, [isOpen]);

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
