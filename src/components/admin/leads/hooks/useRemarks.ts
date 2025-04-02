
import { useState, useEffect, useRef, useCallback } from 'react';
import { LeadService, LeadRemark } from '@/services/LeadService';

export const useRemarks = (leadId: string, isOpen: boolean) => {
  const [remarks, setRemarks] = useState<LeadRemark[]>([]);
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
      setRemarks([]);
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

  // Fetch remarks with proper request cancellation
  const fetchRemarks = useCallback(async () => {
    if (!isOpen || !leadId || !isMounted.current) return;
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    try {
      const remarkData = await LeadService.getRemarks(leadId);
      if (isMounted.current) {
        setRemarks(remarkData);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && isMounted.current) {
        console.error('Error fetching remarks:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [isOpen, leadId]);
  
  // Add a new remark
  const addRemark = useCallback(async (remark: string): Promise<boolean> => {
    if (!leadId) return false;
    
    try {
      const success = await LeadService.addRemark(leadId, remark);
      if (success && isMounted.current) {
        // Refresh remarks list
        fetchRemarks();
      }
      return success;
    } catch (error) {
      console.error('Error adding remark:', error);
      return false;
    }
  }, [leadId, fetchRemarks]);

  // Fetch data when dialog is opened
  useEffect(() => {
    if (isOpen && leadId && isMounted.current) {
      fetchRemarks();
    }
    
    // Cleanup on effect change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isOpen, leadId, fetchRemarks]);

  return {
    remarks,
    isLoading,
    refresh: fetchRemarks,
    addRemark,
    cleanup
  };
};
