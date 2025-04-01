
import { useState, useEffect } from 'react';

export const useLeadDialogState = (
  initialOpen: boolean, 
  onOpenChange: (open: boolean) => void
) => {
  const [activeTab, setActiveTab] = useState("details");
  
  // Reset tab state when dialog closes
  useEffect(() => {
    if (!initialOpen) {
      setActiveTab("details");
    }
  }, [initialOpen]);

  // Handle dialog state changes
  const handleOpenChange = (newOpen: boolean) => {
    // Always notify parent component of changes immediately
    onOpenChange(newOpen);
  };

  return {
    activeTab,
    setActiveTab,
    handleOpenChange
  };
};
