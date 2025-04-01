
import { useState } from 'react';
import { Lead, LeadService } from '@/services/LeadService';
import { useToast } from '@/hooks/use-toast';

export const useLeadForm = (lead: Lead, onSuccess: () => void) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Lead>>({ ...lead });
  const [isUpdating, setIsUpdating] = useState(false);
  
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
      
      onSuccess();
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

  // Reset form data when lead changes
  const resetForm = () => {
    setFormData({ ...lead });
  };

  return {
    formData,
    isUpdating,
    handleChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    resetForm
  };
};
