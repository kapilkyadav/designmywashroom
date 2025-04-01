import { useState, useEffect } from 'react';
import { LeadService } from '@/services/LeadService';
import { useToast } from '@/hooks/use-toast';
import { LeadSyncConfigLocal, ColumnMapping, ServiceLeadSyncConfig } from '../types';

export const useSyncConfig = () => {
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
          
          if (data.sync_interval_minutes >= 60 && data.sync_interval_minutes % 60 === 0) {
            intervalUnit = 'hours';
            interval = data.sync_interval_minutes / 60;
          }
          
          const localConfig: LeadSyncConfigLocal = {
            id: data.id,
            sheet_url: data.sheet_url,
            sheet_name: data.sheet_name || 'Sheet1',
            header_row: data.header_row || 1,
            sync_interval: interval,
            interval_unit: intervalUnit,
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
      
      let syncIntervalMinutes = config.sync_interval;
      if (config.interval_unit === 'hours') {
        syncIntervalMinutes = config.sync_interval * 60;
      }
      
      const serviceConfig: Partial<ServiceLeadSyncConfig> = {
        id: config.id,
        sheet_url: config.sheet_url,
        sheet_name: config.sheet_name,
        header_row: config.header_row,
        column_mapping: config.column_mapping,
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
  
  const handleSheetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      sheet_name: e.target.value
    });
  };
  
  const handleHeaderRowChange = (value: string) => {
    setConfig({
      ...config,
      header_row: parseInt(value, 10)
    });
  };

  return {
    isLoading,
    isSaving,
    currentTab,
    setCurrentTab,
    config,
    setConfig,
    handleSyncIntervalChange,
    handleIntervalUnitChange,
    handleAutoSyncChange,
    handleColumnMappingChange,
    handleSave,
    handleSheetNameChange,
    handleHeaderRowChange
  };
};
