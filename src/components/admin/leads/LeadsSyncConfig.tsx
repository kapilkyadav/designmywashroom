
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  sheet_name: string;
  header_row: number;
  sync_interval: number;
  interval_unit: 'minutes' | 'hours';
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
  const [currentTab, setCurrentTab] = useState('general');
  const [config, setConfig] = useState<LeadSyncConfigLocal>({
    sheet_url: '',
    sheet_name: 'Sheet1',
    header_row: 1,
    sync_interval: 24,
    interval_unit: 'hours',
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
          let intervalUnit: 'minutes' | 'hours' = 'minutes';
          let interval = data.sync_interval_minutes;
          
          // Convert to hours if applicable
          if (data.sync_interval_minutes >= 60 && data.sync_interval_minutes % 60 === 0) {
            intervalUnit = 'hours';
            interval = data.sync_interval_minutes / 60;
          }
          
          // Map service data to our local structure
          const localConfig: LeadSyncConfigLocal = {
            id: data.id,
            sheet_url: data.sheet_url,
            sheet_name: data.sheet_name || 'Sheet1',
            header_row: data.header_row || 1,
            sync_interval: interval,
            interval_unit: intervalUnit,
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
      sync_interval: parseInt(value, 10)
    });
  };
  
  const handleIntervalUnitChange = (value: 'minutes' | 'hours') => {
    setConfig({
      ...config,
      interval_unit: value
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
      
      // Convert sync interval to minutes for the service
      let syncIntervalMinutes = config.sync_interval;
      if (config.interval_unit === 'hours') {
        syncIntervalMinutes = config.sync_interval * 60;
      }
      
      // Convert our local config to the format expected by the service
      const serviceConfig: Partial<ServiceLeadSyncConfig> = {
        id: config.id,
        sheet_url: config.sheet_url,
        sheet_name: config.sheet_name,
        header_row: config.header_row,
        column_mapping: config.column_mapping,
        // Respect auto_sync_enabled flag
        sync_interval_minutes: config.auto_sync_enabled ? syncIntervalMinutes : 0
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
  
  // Handle sheet name change
  const handleSheetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      sheet_name: e.target.value
    });
  };
  
  // Handle header row change
  const handleHeaderRowChange = (value: string) => {
    setConfig({
      ...config,
      header_row: parseInt(value, 10)
    });
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
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sheet">Sheet Settings</TabsTrigger>
            <TabsTrigger value="mapping">Column Mapping</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
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
              <Label htmlFor="interval_unit">Sync Interval Type</Label>
              <Select
                value={config.interval_unit}
                onValueChange={(value: 'minutes' | 'hours') => handleIntervalUnitChange(value)}
                disabled={!config.auto_sync_enabled}
              >
                <SelectTrigger id="interval_unit">
                  <SelectValue placeholder="Select interval type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {config.interval_unit === 'minutes' ? (
              <div className="space-y-2">
                <Label htmlFor="sync_interval_minutes">Sync Every (Minutes)</Label>
                <Select
                  value={config.sync_interval.toString()}
                  onValueChange={handleSyncIntervalChange}
                  disabled={!config.auto_sync_enabled}
                >
                  <SelectTrigger id="sync_interval_minutes">
                    <SelectValue placeholder="Select minutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="sync_interval_hours">Sync Every (Hours)</Label>
                <Select
                  value={config.sync_interval.toString()}
                  onValueChange={handleSyncIntervalChange}
                  disabled={!config.auto_sync_enabled}
                >
                  <SelectTrigger id="sync_interval_hours">
                    <SelectValue placeholder="Select hours" />
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
            )}
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="sheet" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configure which worksheet and header row to use for data synchronization
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sheet_name">Sheet Name</Label>
                <Input
                  id="sheet_name"
                  placeholder="Sheet1"
                  value={config.sheet_name}
                  onChange={handleSheetNameChange}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  The name of the worksheet tab in your Google Sheet
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="header_row">Header Row</Label>
                <Select
                  value={config.header_row.toString()}
                  onValueChange={handleHeaderRowChange}
                >
                  <SelectTrigger id="header_row">
                    <SelectValue placeholder="Select header row" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Row {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  The row containing your column headers
                </p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Sheet Settings
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="mapping" className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LeadsSyncConfig;
