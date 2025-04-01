
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead, LeadService, LeadActivityLog, LeadRemark } from '@/services/LeadService';
import { useToast } from '@/hooks/use-toast';
import LeadDetailsForm from './components/LeadDetailsForm';
import ActivityLogTab from './components/ActivityLogTab';
import RemarksTab from './components/RemarksTab';

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
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Lead>>({ ...lead });
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [activityLogs, setActivityLogs] = useState<LeadActivityLog[]>([]);
  const [remarks, setRemarks] = useState<LeadRemark[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
  
  // Reset form data when lead changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({ ...lead });
      fetchActivityLogs();
      fetchRemarks();
    } else {
      // Reset state when dialog closes
      setActiveTab("details");
    }
  }, [open, lead.id]);
  
  const fetchActivityLogs = async () => {
    if (!open) return; // Don't fetch if dialog is closed
    
    setIsLoadingLogs(true);
    try {
      const logs = await LeadService.getActivityLogs(lead.id);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };
  
  const fetchRemarks = async () => {
    if (!open) return; // Don't fetch if dialog is closed
    
    setIsLoadingRemarks(true);
    try {
      const remarkData = await LeadService.getRemarks(lead.id);
      setRemarks(remarkData);
    } catch (error) {
      console.error('Error fetching remarks:', error);
    } finally {
      setIsLoadingRemarks(false);
    }
  };
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleDateChange = (date: Date | undefined, fieldName: string) => {
    if (date) {
      setFormData({ ...formData, [fieldName]: date.toISOString() });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      await LeadService.updateLead(lead.id, formData);
      
      toast({
        title: "Lead updated",
        description: "The lead has been successfully updated."
      });
      
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead information",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle dialog state changes internally before notifying parent
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // First reset local state
      setActiveTab("details");
      // Then notify parent
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="remarks">Remarks</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
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
                fetchRemarks();
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
