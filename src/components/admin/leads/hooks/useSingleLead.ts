import { useState, useEffect, useRef, useCallback } from 'react';
import { Lead } from '@/services/leads';
import { LeadService } from '@/services/leads';

export const useSingleLead = (leadId: string, isOpen: boolean) => {
  const [lead, setLead] = useState<Lead | null>(null);
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
      setLead(null);
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

  // Fetch lead details with proper request cancellation
  const fetchLeadDetails = useCallback(async () => {
    if (!isOpen || !leadId || !isMounted.current) return;
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    try {
      const leadData = await LeadService.getLead(leadId);
      if (isMounted.current && leadData) {
        setLead(leadData);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && isMounted.current) {
        console.error('Error fetching lead details:', error);
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
      fetchLeadDetails();
    }
    
    // Cleanup on effect change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isOpen, leadId, fetchLeadDetails]);

  return {
    lead,
    isLoading,
    refresh: fetchLeadDetails,
    cleanup
  };
};
