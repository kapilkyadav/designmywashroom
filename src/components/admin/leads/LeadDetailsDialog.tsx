
import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead } from '@/services/LeadService';
import LeadDetailsForm from './components/LeadDetailsForm';
import ActivityLogTab from './components/ActivityLogTab';
import RemarksTab from './components/RemarksTab';
import { useLeadDetails } from './hooks/useLeadDetails';
import { useLeadForm } from './hooks/useLeadForm';
import { useLeadDialogState } from './hooks/useLeadDialogState';

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
  
  // Custom hooks for different concerns
  const { activeTab, setActiveTab, handleOpenChange } = useLeadDialogState(open, onOpenChange);
  const { formData, isUpdating, handleChange, handleSelectChange, handleDateChange, handleSubmit, resetForm } = useLeadForm(lead, () => {
    onUpdate();
    handleOpenChange(false);
  });
  const { activityLogs, remarks, lead: fetchedLead, isLoadingLogs, isLoadingRemarks, refreshRemarks, refreshLogs, refreshLead } = useLeadDetails(lead.id, open);

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
  }, [open, lead.id]);

  // Handle body scrolling
  useEffect(() => {
    // Store original body style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    if (open) {
      // Disable scrolling when dialog is open
      document.body.style.overflow = 'hidden';
    } else {
      // Enable scrolling when dialog is closed
      document.body.style.overflow = originalStyle;
    }
    
    // Cleanup function to ensure scrolling is re-enabled
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [open]);

  // Handle dialog state changes
  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Make sure to reset state and enable scrolling
      document.body.style.overflow = '';
      setActiveTab("details");
    }
    handleOpenChange(newOpen);
  };

  // Handle remark added - refresh data and update parent
  const handleRemarkAdded = async (newRemark: string) => {
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
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent 
        className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]"
        onInteractOutside={(e) => {
          // Prevent clicks from propagating through the dialog
          e.preventDefault();
        }}
        onEscapeKeyDown={() => {
          // Ensure we properly handle the escape key
          handleDialogOpenChange(false);
        }}
      >
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
          <DialogDescription>
            View and modify details for {currentLead.customer_name}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              onCancel={() => handleDialogOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsDialog;
