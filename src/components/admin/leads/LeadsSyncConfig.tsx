
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LeadService } from '@/services/LeadService';

// Define ColumnMapping to match what the service expects
interface ColumnMapping {
  lead_date: string;
  customer_name: string;
  email: string;
  phone: string;
  location: string;
  project_type: string;
  budget_preference: string;
  notes: string;
  [key: string]: string; // Add index signature to make it compatible with Record<string, string>
}

// Define a local interface that matches our component's needs
interface LeadSyncConfigLocal {
  id?: string;
  sheet_url: string;
  interval_hours: number;
  auto_sync_enabled: boolean;
  column_mapping: ColumnMapping;
  last_synced_at: string | null;
}

// Interface for mapping to the service data structure
interface ServiceLeadSyncConfig {
  id?: string;
  sheet_url: string;
  sheet_name: string;
  header_row: number;
  column_mapping: Record<string, string>;
  sync_interval_minutes: number;
  last_sync_at: string | null;
  created_at?: string;
  updated_at?: string;
}

const LeadsSyncConfig: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<LeadSyncConfigLocal>({
    sheet_url: '',
    interval_hours: 24,
    auto_sync_enabled: true,
    column_mapping: {
      lead_date: '',
      customer_name: '',
      email: '',
      phone: '',
      location: '',
      project_type: '',
      budget_preference: '',
      notes: ''
    },
    last_synced_at: null
  });
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await LeadService.getSyncConfig();
        if (data) {
          // Map service data to our local structure
          const localConfig: LeadSyncConfigLocal = {
            id: data.id,
            sheet_url: data.sheet_url,
            // Convert minutes to hours
            interval_hours: Math.round(data.sync_interval_minutes / 60),
            // Assume enabled if interval > 0
            auto_sync_enabled: data.sync_interval_minutes > 0,
            column_mapping: data.column_mapping as ColumnMapping,
            last_synced_at: data.last_sync_at
          };
          setConfig(localConfig);
        }
      } catch (error) {
        console.error('Error fetching sync config:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sync configuration',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, [toast]);
  
  const handleSyncIntervalChange = (value: string) => {
    setConfig({
      ...config,
      interval_hours: parseInt(value, 10)
    });
  };
  
  const handleAutoSyncChange = (checked: boolean) => {
    setConfig({
      ...config,
      auto_sync_enabled: checked
    });
  };
  
  const handleColumnMappingChange = (field: keyof ColumnMapping, value: string) => {
    setConfig({
      ...config,
      column_mapping: {
        ...config.column_mapping,
        [field]: value
      }
    });
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Convert our local config to the format expected by the service
      const serviceConfig: Partial<ServiceLeadSyncConfig> = {
        id: config.id,
        sheet_url: config.sheet_url,
        sheet_name: 'Sheet1', // Default sheet name if not in our local model
        header_row: 1, // Default header row if not in our local model
        column_mapping: config.column_mapping,
        // Convert hours to minutes and respect auto_sync_enabled flag
        sync_interval_minutes: config.auto_sync_enabled ? config.interval_hours * 60 : 0
      };
      
      await LeadService.updateSyncConfig(serviceConfig);
      
      toast({
        title: 'Configuration saved',
        description: 'Lead sync configuration has been updated successfully'
      });
    } catch (error) {
      console.error('Error saving sync config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save sync configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Synchronization Settings</CardTitle>
        <CardDescription>
          Configure how leads are synchronized from your Google Sheet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheet_url">Google Sheet URL</Label>
            <Input
              id="sheet_url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={config.sheet_url}
              onChange={(e) => setConfig({ ...config, sheet_url: e.target.value })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Automatic Synchronization</h4>
              <p className="text-sm text-muted-foreground">
                Automatically sync leads from Google Sheet
              </p>
            </div>
            <Switch
              checked={config.auto_sync_enabled}
              onCheckedChange={handleAutoSyncChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sync_interval">Sync Interval</Label>
            <Select
              value={config.interval_hours.toString()}
              onValueChange={handleSyncIntervalChange}
              disabled={!config.auto_sync_enabled}
            >
              <SelectTrigger id="sync_interval">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Every 1 hour</SelectItem>
                <SelectItem value="6">Every 6 hours</SelectItem>
                <SelectItem value="12">Every 12 hours</SelectItem>
                <SelectItem value="24">Every 24 hours</SelectItem>
                <SelectItem value="48">Every 2 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-3">Column Mappings</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Map your Google Sheet columns to lead data fields
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="column_lead_date">Lead Date</Label>
              <Input
                id="column_lead_date"
                placeholder="e.g., A"
                value={config.column_mapping.lead_date}
                onChange={(e) => handleColumnMappingChange('lead_date', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="column_customer_name">Customer Name</Label>
              <Input
                id="column_customer_name"
                placeholder="e.g., B"
                value={config.column_mapping.customer_name}
                onChange={(e) => handleColumnMappingChange('customer_name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="column_email">Email</Label>
              <Input
                id="column_email"
                placeholder="e.g., C"
                value={config.column_mapping.email}
                onChange={(e) => handleColumnMappingChange('email', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="column_phone">Phone</Label>
              <Input
                id="column_phone"
                placeholder="e.g., D"
                value={config.column_mapping.phone}
                onChange={(e) => handleColumnMappingChange('phone', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="column_location">Location</Label>
              <Input
                id="column_location"
                placeholder="e.g., E"
                value={config.column_mapping.location}
                onChange={(e) => handleColumnMappingChange('location', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="column_project_type">Project Type</Label>
              <Input
                id="column_project_type"
                placeholder="e.g., F"
                value={config.column_mapping.project_type}
                onChange={(e) => handleColumnMappingChange('project_type', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="column_budget">Budget Preference</Label>
              <Input
                id="column_budget"
                placeholder="e.g., G"
                value={config.column_mapping.budget_preference}
                onChange={(e) => handleColumnMappingChange('budget_preference', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="column_notes">Notes</Label>
              <Input
                id="column_notes"
                placeholder="e.g., H"
                value={config.column_mapping.notes}
                onChange={(e) => handleColumnMappingChange('notes', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadsSyncConfig;
