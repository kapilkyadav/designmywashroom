
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Lead } from '@/services/LeadService';
import { useLeadDetails } from './hooks/useLeadDetails';
import { useLeadForm } from './hooks/useLeadForm';
import { useLeadDialogState } from './hooks/useLeadDialogState';

// Import the newly created components
import DialogHeader from './components/DialogHeader';
import DialogTabs from './components/DialogTabs';
import LoadingIndicator from './components/LoadingIndicator';

interface LeadDetailsDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const LeadDetailsDialog: React.FC<LeadDetailsDialogProps> = ({
  lead,
  open,
  onOpenChange,
  onUpdate
}) => {
  // State management
  const [currentLead, setCurrentLead] = useState<Lead>(lead);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const unmountingRef = useRef(false);
  const openRef = useRef(open);
  
  // Update openRef when open prop changes
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  
  // Custom hooks for different concerns
  const { activeTab, setActiveTab, handleOpenChange, restoreBodyScroll } = useLeadDialogState(open, (newOpen) => {
    if (!newOpen) {
      // Start transition when closing
      setIsTransitioning(true);
      
      // Short timeout to ensure animation completes before state updates
      setTimeout(() => {
        if (!unmountingRef.current) {
          onOpenChange(false);
          setIsTransitioning(false);
          
          // Make sure to refresh data after dialog fully closes
          onUpdate();
        }
      }, 300); // Matching animation duration from Shadcn Sheet
    } else {
      onOpenChange(true);
    }
  });
  
  const { formData, isUpdating, handleChange, handleSelectChange, handleDateChange, handleSubmit, resetForm } = useLeadForm(lead, () => {
    onUpdate();
    handleOpenChange(false);
  });
  
  const { 
    activityLogs, 
    remarks, 
    lead: fetchedLead, 
    isLoadingLogs, 
    isLoadingRemarks, 
    refreshRemarks, 
    refreshLogs, 
    refreshLead,
    cleanup
  } = useLeadDetails(lead.id, open);

  // Comprehensive cleanup on unmount with multiple safety measures
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    const handleBeforeUnload = () => {
      // Emergency cleanup for page reloads/navigation
      restoreBodyScroll();
      cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      unmountingRef.current = true;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Multiple cleanup approaches for maximum reliability
      restoreBodyScroll();
      cleanup();
      
      // Restore original styles or ensure scrollability
      document.body.style.overflow = originalOverflow || 'auto';
      document.body.style.position = originalPosition || '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('no-scroll', 'overflow-hidden');
      
      // Force a style recalculation
      document.body.offsetHeight;
      
      // Force refresh of page interaction after component is gone
      setTimeout(() => {
        document.body.style.overflow = 'auto';
        window.scrollTo(window.scrollX, window.scrollY);
      }, 0);
    };
  }, [restoreBodyScroll, cleanup]);
  
  // Update currentLead when lead changes
  useEffect(() => {
    setCurrentLead(lead);
  }, [lead]);

  // Update currentLead when fetchedLead is updated
  useEffect(() => {
    if (fetchedLead) {
      setCurrentLead(fetchedLead);
    }
  }, [fetchedLead]);

  // Reset form when lead changes or dialog opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, lead.id, resetForm]);

  // Handle remark added with proper state updates
  const handleRemarkAdded = useCallback(async (newRemark: string) => {
    // First update the current lead's remark in the local state 
    // to immediately reflect changes in the UI
    setCurrentLead(prev => ({
      ...prev,
      remarks: newRemark
    }));
    
    // Then refresh all data
    await Promise.all([
      refreshRemarks(),
      refreshLogs(),
      refreshLead()
    ]);
    
    // Update parent component
    onUpdate();
  }, [refreshRemarks, refreshLogs, refreshLead, onUpdate]);

  return (
    <Sheet 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <SheetContent 
        side="right"
        className="w-full sm:w-[600px] overflow-y-auto"
      >
        <DialogHeader customerName={currentLead.customer_name} />
        
        {isTransitioning ? (
          <LoadingIndicator />
        ) : (
          <div className="py-4">
            <DialogTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              formData={formData}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleDateChange={handleDateChange}
              handleSubmit={handleSubmit}
              isUpdating={isUpdating}
              onCancel={() => handleOpenChange(false)}
              isLoadingRemarks={isLoadingRemarks}
              remarks={remarks}
              currentLead={currentLead}
              onRemarkAdded={handleRemarkAdded}
              isLoadingLogs={isLoadingLogs}
              activityLogs={activityLogs}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default LeadDetailsDialog;
