
import { useState, useEffect, useCallback } from 'react';

export const useLeadDialogState = (
  initialOpen: boolean, 
  onOpenChange: (open: boolean) => void
) => {
  const [activeTab, setActiveTab] = useState("details");
  
  // Safety mechanism to ensure body scrolling is restored
  const restoreBodyScroll = useCallback(() => {
    // Remove any inline styles that might be blocking scrolling
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    document.documentElement.style.removeProperty('overflow');
  }, []);

  // Reset everything when dialog closes
  useEffect(() => {
    if (!initialOpen) {
      setActiveTab("details");
      restoreBodyScroll();
    }
    
    // Always ensure scroll is restored when component unmounts
    return () => {
      restoreBodyScroll();
    };
  }, [initialOpen, restoreBodyScroll]);

  // Handle dialog state changes with safety mechanisms
  const handleOpenChange = useCallback((newOpen: boolean) => {
    // If closing, ensure we restore scroll first before state changes
    if (!newOpen) {
      restoreBodyScroll();
    }
    
    // Notify parent component of change
    onOpenChange(newOpen);
  }, [onOpenChange, restoreBodyScroll]);

  return {
    activeTab,
    setActiveTab,
    handleOpenChange,
    restoreBodyScroll
  };
};
