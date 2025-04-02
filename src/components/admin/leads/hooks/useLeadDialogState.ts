
import { useState, useEffect, useCallback } from 'react';

export const useLeadDialogState = (
  initialOpen: boolean, 
  onOpenChange: (open: boolean) => void
) => {
  const [activeTab, setActiveTab] = useState("details");
  
  // Improved scroll restoration with better approach
  const restoreBodyScroll = useCallback(() => {
    // Clear any inline styles
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('padding-right');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('width');
    document.documentElement.style.removeProperty('overflow');
    
    // Remove any classes that might be affecting scroll
    document.body.classList.remove('no-scroll', 'overflow-hidden');
    
    // Force layout recalculation
    document.body.offsetHeight;
    
    // Ensure body is scrollable
    document.body.style.overflow = 'auto';
    
    // Wait for next frame to ensure styles are applied
    requestAnimationFrame(() => {
      // Restore scroll position if necessary
      window.scrollTo({
        top: parseInt(localStorage.getItem('scrollPosition') || '0', 10),
        behavior: 'auto'
      });
      
      // Remove any other styles that might interfere
      document.body.style.removeProperty('overflow'); // Remove the auto style after restoration
    });
  }, []);

  // Save scroll position before dialog opens
  const saveScrollPosition = useCallback(() => {
    localStorage.setItem('scrollPosition', window.scrollY.toString());
  }, []);

  // More robust dialog state management with cleaner transitions
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      // Restore scroll immediately
      restoreBodyScroll();
      
      // Then notify parent
      onOpenChange(false);
    } else {
      // Save position before opening
      saveScrollPosition();
      onOpenChange(true);
    }
  }, [onOpenChange, restoreBodyScroll, saveScrollPosition]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!initialOpen) {
      setActiveTab("details");
      restoreBodyScroll();
    }
    
    // Critical cleanup when component unmounts
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
