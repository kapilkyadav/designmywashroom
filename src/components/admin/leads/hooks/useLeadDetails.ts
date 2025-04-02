
import { useState, useEffect, useRef, useCallback } from 'react';
import { Lead } from '@/services/LeadService';
import { useActivityLogs } from './useActivityLogs';
import { useRemarks } from './useRemarks';
import { useSingleLead } from './useSingleLead';
import { useCleanup } from './useCleanup';

export const useLeadDetails = (leadId: string, isOpen: boolean) => {
  // Combined refs
  const isMounted = useRef(true);
  
  // Import individual hooks
  const { 
    activityLogs, 
    isLoading: isLoadingLogs, 
    refresh: refreshLogs,
    cleanup: cleanupLogs
  } = useActivityLogs(leadId, isOpen);
  
  const {
    remarks,
    isLoading: isLoadingRemarks,
    refresh: refreshRemarks,
    cleanup: cleanupRemarks
  } = useRemarks(leadId, isOpen);
  
  const {
    lead,
    isLoading: isLoadingLead,
    refresh: refreshLead,
    cleanup: cleanupLead
  } = useSingleLead(leadId, isOpen);
  
  const {
    cleanup: cleanupResources,
    restoreBodyScroll
  } = useCleanup();

  // Set up mount/unmount handling
  useEffect(() => {
    isMounted.current = true;
    
    // Critical cleanup on unmount
    return () => {
      isMounted.current = false;
      cleanupAll();
    };
  }, []);

  // Combined master cleanup function
  const cleanupAll = useCallback(() => {
    cleanupLogs();
    cleanupRemarks();
    cleanupLead();
    cleanupResources();
    
    // Ensure body scroll is restored
    restoreBodyScroll();
  }, [cleanupLogs, cleanupRemarks, cleanupLead, cleanupResources, restoreBodyScroll]);

  // Clear states and cancel requests when dialog closes
  useEffect(() => {
    if (!isOpen) {
      cleanupAll();
    }
  }, [isOpen, cleanupAll]);

  return {
    activityLogs,
    remarks,
    lead,
    isLoadingLogs,
    isLoadingRemarks,
    isLoadingLead,
    refreshRemarks,
    refreshLogs,
    refreshLead,
    cleanup: cleanupAll
  };
};
