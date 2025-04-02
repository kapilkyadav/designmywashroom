
import { useState, useEffect, useRef, useCallback } from 'react';
import { Lead, LeadService, LeadActivityLog, LeadRemark } from '@/services/LeadService';

export const useLeadDetails = (leadId: string, isOpen: boolean) => {
  const [activityLogs, setActivityLogs] = useState<LeadActivityLog[]>([]);
  const [remarks, setRemarks] = useState<LeadRemark[]>([]);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  
  // Use refs to track mounted state and for request cancellation
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const cleanupTimeoutRef = useRef<number | null>(null);

  // Enhanced cleanup function that ensures all resources are released
  const cleanup = useCallback(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Clear any pending timeouts
    if (cleanupTimeoutRef.current) {
      window.clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
    
    // Reset state only if component is still mounted
    if (isMounted.current) {
      setActivityLogs([]);
      setRemarks([]);
      setLead(null);
      setIsLoadingLogs(false);
      setIsLoadingRemarks(false);
      setIsLoadingLead(false);
    }
  }, []);

  // Set up mount/unmount handling
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

  // Improved fetch functions with request cancellation
  const fetchActivityLogs = useCallback(async () => {
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
    } catch (error: any) {
      // Only log error if it's not from aborting
      if (error.name !== 'AbortError') {
        console.error('Error fetching activity logs:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingLogs(false);
      }
    }
  }, [isOpen, leadId]);
  
  const fetchRemarks = useCallback(async () => {
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
    } catch (error: any) {
      // Only log error if it's not from aborting
      if (error.name !== 'AbortError') {
        console.error('Error fetching remarks:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingRemarks(false);
      }
    }
  }, [isOpen, leadId]);

  const fetchLeadDetails = useCallback(async () => {
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
    } catch (error: any) {
      // Only log error if it's not from aborting
      if (error.name !== 'AbortError') {
        console.error('Error fetching lead details:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingLead(false);
      }
    }
  }, [isOpen, leadId]);

  // Fetch data when dialog is opened or lead ID changes with better cleanup
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
  }, [isOpen, leadId, fetchActivityLogs, fetchRemarks, fetchLeadDetails]);

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
