
import { useState, useEffect, useCallback } from 'react';

export const useLeadDialogState = (
  initialOpen: boolean, 
  onOpenChange: (open: boolean) => void
) => {
  const [activeTab, setActiveTab] = useState("details");
  
  // Full body scroll restoration with multiple approaches for reliability
  const restoreBodyScroll = useCallback(() => {
    // Remove all scroll locks with multiple approaches for cross-browser compatibility
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('width');
    document.documentElement.style.removeProperty('overflow');
    document.body.classList.remove('no-scroll', 'overflow-hidden');
    
    // Force repaint to ensure UI is responsive
    window.scrollTo(window.scrollX, window.scrollY);
  }, []);

  // More robust dialog state management
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      // Restore scroll immediately as first priority
      restoreBodyScroll();
      
      // Then notify parent after a safe delay for animations
      setTimeout(() => {
        onOpenChange(false);
      }, 150);
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
    
    // Critical: Always ensure scroll is restored when component unmounts
    // This is essential to prevent the UI from becoming unresponsive
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
