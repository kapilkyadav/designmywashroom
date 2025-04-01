
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead, LeadService, LeadActivityLog } from '@/services/LeadService';
import { useToast } from '@/hooks/use-toast';
import LeadDetailsForm from './components/LeadDetailsForm';
import ActivityLogTab from './components/ActivityLogTab';

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
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  
  // Fetch activity logs when the dialog opens
  useEffect(() => {
    if (open) {
      fetchActivityLogs();
    }
  }, [open, lead.id]);
  
  const fetchActivityLogs = async () => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
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
              onCancel={() => onOpenChange(false)}
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
