
import { useState, useEffect } from 'react';

export const useLeadDialogState = (
  initialOpen: boolean, 
  onOpenChange: (open: boolean) => void
) => {
  const [activeTab, setActiveTab] = useState("details");
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!initialOpen) {
      setActiveTab("details");
    }
  }, [initialOpen]);

  // Handle dialog state changes internally before notifying parent
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // First reset local state
      setActiveTab("details");
      
      // Then notify parent immediately - no timeouts
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };

  return {
    activeTab,
    setActiveTab,
    handleOpenChange
  };
};
