
import { useState, useEffect, useRef, useCallback } from 'react';
import { LeadService, LeadActivityLog } from '@/services/LeadService';

export const useActivityLogs = (leadId: string, isOpen: boolean) => {
  const [activityLogs, setActivityLogs] = useState<LeadActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs for better request cancellation
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function for unmounting or dialog closing
  const cleanup = useCallback(() => {
    // Cancel pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Only reset state if component is still mounted
    if (isMounted.current) {
      setActivityLogs([]);
      setIsLoading(false);
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

  // Fetch activity logs with proper request cancellation
  const fetchActivityLogs = useCallback(async () => {
    if (!isOpen || !leadId || !isMounted.current) return; 
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    try {
      const logs = await LeadService.getActivityLogs(leadId);
      if (isMounted.current) {
        setActivityLogs(logs);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && isMounted.current) {
        console.error('Error fetching activity logs:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [isOpen, leadId]);
  
  // Fetch data when dialog is opened
  useEffect(() => {
    if (isOpen && leadId && isMounted.current) {
      fetchActivityLogs();
    }
    
    // Cleanup on effect change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isOpen, leadId, fetchActivityLogs]);

  return {
    activityLogs,
    isLoading,
    refresh: fetchActivityLogs,
    cleanup
  };
};
