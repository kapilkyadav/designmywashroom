
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead } from '@/services/LeadService';
import LeadDetailsForm from './components/LeadDetailsForm';
import ActivityLogTab from './components/ActivityLogTab';
import RemarksTab from './components/RemarksTab';
import { useLeadDetails } from './hooks/useLeadDetails';
import { useLeadForm } from './hooks/useLeadForm';
import { useLeadDialogState } from './hooks/useLeadDialogState';
import { Loader2 } from 'lucide-react';

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
  // Track current lead data to ensure we have the latest remarks
  const [currentLead, setCurrentLead] = useState<Lead>(lead);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const unmountingRef = useRef(false);
  
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

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      unmountingRef.current = true;
      restoreBodyScroll();
      cleanup();
    };
  }, [restoreBodyScroll, cleanup]);
  
  // Update currentLead when lead changes or refreshLead is called
  useEffect(() => {
    setCurrentLead(lead);
  }, [lead]);

  // Update currentLead when fetchedLead is updated
  useEffect(() => {
    if (fetchedLead) {
      setCurrentLead(fetchedLead);
    }
  }, [fetchedLead]);

  // Reset form when lead changes
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, lead.id, resetForm]);

  // Handle remark added - refresh data and update parent
  const handleRemarkAdded = useCallback(async (newRemark: string) => {
    // First update the current lead's remark in the local state 
    // to immediately reflect changes in the UI
    setCurrentLead(prev => ({
      ...prev,
      remarks: newRemark
    }));
    
    // Then refresh all data
    await refreshRemarks();
    await refreshLogs();
    await refreshLead(); // This will fetch the latest lead data
    onUpdate(); // Update the main leads list to reflect the new remark
  }, [refreshRemarks, refreshLogs, refreshLead, onUpdate]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent 
        side="right"
        className="w-full sm:w-[600px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Lead Details</SheetTitle>
          <SheetDescription>
            View and modify details for {currentLead.customer_name}
          </SheetDescription>
        </SheetHeader>
        
        {isTransitioning ? (
          <div className="flex items-center justify-center h-[80vh]">
            <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
          </div>
        ) : (
          <div className="py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="remarks" className="flex-1">Remarks</TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">Activity Log</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="pt-4">
                <LeadDetailsForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSelectChange={handleSelectChange}
                  handleDateChange={handleDateChange}
                  handleSubmit={handleSubmit}
                  isUpdating={isUpdating}
                  onCancel={() => handleOpenChange(false)}
                />
              </TabsContent>
              
              <TabsContent value="remarks" className="pt-4">
                <RemarksTab 
                  leadId={currentLead.id}
                  isLoading={isLoadingRemarks}
                  remarks={remarks}
                  currentRemark={currentLead.remarks}
                  onRemarkAdded={handleRemarkAdded}
                />
              </TabsContent>
              
              <TabsContent value="activity" className="pt-4">
                <ActivityLogTab 
                  isLoading={isLoadingLogs} 
                  activityLogs={activityLogs} 
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default LeadDetailsDialog;
