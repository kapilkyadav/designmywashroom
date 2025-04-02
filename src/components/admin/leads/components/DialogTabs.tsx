
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadDetailsForm from './LeadDetailsForm';
import ActivityLogTab from './ActivityLogTab';
import RemarksTab from './RemarksTab';
import { Lead, LeadActivityLog, LeadRemark } from '@/services/LeadService';

interface DialogTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formData: Partial<Lead>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | undefined, fieldName: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
  onCancel: () => void;
  isLoadingRemarks: boolean;
  remarks: LeadRemark[];
  currentLead: Lead;
  onRemarkAdded: (remark: string) => Promise<void>;
  isLoadingLogs: boolean;
  activityLogs: LeadActivityLog[];
}

const DialogTabs: React.FC<DialogTabsProps> = ({
  activeTab,
  setActiveTab,
  formData,
  handleChange,
  handleSelectChange,
  handleDateChange,
  handleSubmit,
  isUpdating,
  onCancel,
  isLoadingRemarks,
  remarks,
  currentLead,
  onRemarkAdded,
  isLoadingLogs,
  activityLogs
}) => {
  return (
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
          onCancel={onCancel}
        />
      </TabsContent>
      
      <TabsContent value="remarks" className="pt-4">
        <RemarksTab 
          leadId={currentLead.id}
          isLoading={isLoadingRemarks}
          remarks={remarks}
          currentRemark={currentLead.remarks}
          onRemarkAdded={onRemarkAdded}
        />
      </TabsContent>
      
      <TabsContent value="activity" className="pt-4">
        <ActivityLogTab 
          isLoading={isLoadingLogs} 
          activityLogs={activityLogs} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default DialogTabs;
