
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { LeadSyncConfigLocal, ColumnMapping } from '../types';

interface ColumnMappingTabProps {
  config: LeadSyncConfigLocal;
  handleColumnMappingChange: (field: keyof ColumnMapping, value: string) => void;
  handleSave: () => void;
  isSaving: boolean;
}

const ColumnMappingTab: React.FC<ColumnMappingTabProps> = ({
  config,
  handleColumnMappingChange,
  handleSave,
  isSaving
}) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Map your Google Sheet columns to lead data fields
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="column_lead_date">Lead Date</Label>
          <Input
            id="column_lead_date"
            placeholder="e.g., A or Lead Date"
            value={config.column_mapping.lead_date}
            onChange={(e) => handleColumnMappingChange('lead_date', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="column_customer_name">Customer Name</Label>
          <Input
            id="column_customer_name"
            placeholder="e.g., B or Customer"
            value={config.column_mapping.customer_name}
            onChange={(e) => handleColumnMappingChange('customer_name', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="column_email">Email</Label>
          <Input
            id="column_email"
            placeholder="e.g., C or Email"
            value={config.column_mapping.email}
            onChange={(e) => handleColumnMappingChange('email', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="column_phone">Phone</Label>
          <Input
            id="column_phone"
            placeholder="e.g., D or Phone"
            value={config.column_mapping.phone}
            onChange={(e) => handleColumnMappingChange('phone', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="column_location">Location</Label>
          <Input
            id="column_location"
            placeholder="e.g., E or Location"
            value={config.column_mapping.location}
            onChange={(e) => handleColumnMappingChange('location', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="column_project_type">Project Type</Label>
          <Input
            id="column_project_type"
            placeholder="e.g., F or Type"
            value={config.column_mapping.project_type}
            onChange={(e) => handleColumnMappingChange('project_type', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="column_budget">Budget Preference</Label>
          <Input
            id="column_budget"
            placeholder="e.g., G or Budget"
            value={config.column_mapping.budget_preference}
            onChange={(e) => handleColumnMappingChange('budget_preference', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="column_notes">Notes</Label>
          <Input
            id="column_notes"
            placeholder="e.g., H or Notes"
            value={config.column_mapping.notes}
            onChange={(e) => handleColumnMappingChange('notes', e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Column Mapping
        </Button>
      </div>
    </div>
  );
};

export default ColumnMappingTab;
