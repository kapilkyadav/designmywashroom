
import { useState, useEffect, useRef, useCallback } from 'react';
import { ActivityLogService } from '@/services/leads/ActivityLogService';
import { LeadActivityLog } from '@/services/leads';

export const useActivityLogs = (leadId: string, isOpen: boolean) => {
  const [activityLogs, setActivityLogs] = useState<LeadActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (isMounted.current) {
      setActivityLogs([]);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
    }
  }, [isOpen, cleanup]);

  const fetchActivityLogs = useCallback(async () => {
    if (!isOpen || !leadId || !isMounted.current) return; 
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    try {
      // Use the correct method name from ActivityLogService
      const logs = await ActivityLogService.getLeadActivityLogs(leadId);
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
  
  useEffect(() => {
    if (isOpen && leadId && isMounted.current) {
      fetchActivityLogs();
    }
    
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
