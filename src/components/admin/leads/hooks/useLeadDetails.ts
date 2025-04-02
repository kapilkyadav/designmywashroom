
import { useState, useEffect, useRef, useCallback } from 'react';
import { Lead, LeadService, LeadActivityLog, LeadRemark } from '@/services/LeadService';

export const useLeadDetails = (leadId: string, isOpen: boolean) => {
  const [activityLogs, setActivityLogs] = useState<LeadActivityLog[]>([]);
  const [remarks, setRemarks] = useState<LeadRemark[]>([]);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  
  // Use refs to track mounted state and for cancellation
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function to cancel pending requests and reset state
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (isMounted.current) {
      setActivityLogs([]);
      setRemarks([]);
      setLead(null);
      setIsLoadingLogs(false);
      setIsLoadingRemarks(false);
      setIsLoadingLead(false);
    }
  }, []);

  // Set up cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Clear states and cancel requests when dialog closes
  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen, cleanup]);

  const fetchActivityLogs = async () => {
    if (!isOpen || !leadId || !isMounted.current) return; 
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsLoadingLogs(true);
    try {
      const logs = await LeadService.getActivityLogs(leadId);
      if (isMounted.current) {
        setActivityLogs(logs);
      }
    } catch (error) {
      // Only log error if it's not from aborting
      if (error.name !== 'AbortError') {
        console.error('Error fetching activity logs:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingLogs(false);
      }
    }
  };
  
  const fetchRemarks = async () => {
    if (!isOpen || !leadId || !isMounted.current) return;
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsLoadingRemarks(true);
    try {
      const remarkData = await LeadService.getRemarks(leadId);
      if (isMounted.current) {
        setRemarks(remarkData);
      }
    } catch (error) {
      // Only log error if it's not from aborting
      if (error.name !== 'AbortError') {
        console.error('Error fetching remarks:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingRemarks(false);
      }
    }
  };

  const fetchLeadDetails = async () => {
    if (!isOpen || !leadId || !isMounted.current) return;
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsLoadingLead(true);
    try {
      const leadData = await LeadService.getLead(leadId);
      if (isMounted.current && leadData) {
        setLead(leadData);
      }
    } catch (error) {
      // Only log error if it's not from aborting
      if (error.name !== 'AbortError') {
        console.error('Error fetching lead details:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingLead(false);
      }
    }
  };

  // Fetch data when dialog is opened or lead ID changes
  useEffect(() => {
    if (isOpen && leadId && isMounted.current) {
      fetchActivityLogs();
      fetchRemarks();
      fetchLeadDetails();
    }
    
    // Cleanup on effect change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
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
    refreshLead: fetchLeadDetails,
    cleanup
  };
};
