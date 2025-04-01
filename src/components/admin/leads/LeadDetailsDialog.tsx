
import React, { useEffect } from 'react';
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
  // Custom hooks for different concerns
  const { activeTab, setActiveTab, handleOpenChange } = useLeadDialogState(open, onOpenChange);
  const { formData, isUpdating, handleChange, handleSelectChange, handleDateChange, handleSubmit, resetForm } = useLeadForm(lead, () => {
    onUpdate();
    handleOpenChange(false);
  });
  const { activityLogs, remarks, isLoadingLogs, isLoadingRemarks, refreshRemarks } = useLeadDetails(lead.id, open);

  // Reset form when lead changes
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, lead.id]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
          <DialogDescription>
            View and modify details for {lead.customer_name}
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
              onCancel={() => handleOpenChange(false)}
            />
          </TabsContent>
          
          <TabsContent value="remarks" className="pt-4">
            <RemarksTab 
              leadId={lead.id}
              isLoading={isLoadingRemarks}
              remarks={remarks}
              currentRemark={lead.remarks}
              onRemarkAdded={() => {
                refreshRemarks();
                onUpdate(); // Update the main leads list to reflect the new remark
              }}
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
