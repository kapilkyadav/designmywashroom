
import { useState, useEffect, useCallback } from 'react';

export const useLeadDialogState = (
  initialOpen: boolean, 
  onOpenChange: (open: boolean) => void
) => {
  const [activeTab, setActiveTab] = useState("details");
  
  // More robust scroll restoration approach
  const restoreBodyScroll = useCallback(() => {
    // Remove any potential scroll locks by all means
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    document.documentElement.style.removeProperty('overflow');
    document.body.classList.remove('no-scroll', 'overflow-hidden');
  }, []);

  // Handle dialog state changes with fail-safe mechanisms
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      // Restore scroll immediately
      restoreBodyScroll();
      
      // Small delay before state change to allow animation to complete
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
    } else {
      onOpenChange(true);
    }
  }, [onOpenChange, restoreBodyScroll]);

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

  return {
    activeTab,
    setActiveTab,
    handleOpenChange,
    restoreBodyScroll
  };
};
