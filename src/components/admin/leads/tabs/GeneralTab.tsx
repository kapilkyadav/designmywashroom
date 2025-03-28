
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadSyncConfigLocal } from '../types';

interface GeneralTabProps {
  config: LeadSyncConfigLocal;
  setConfig: React.Dispatch<React.SetStateAction<LeadSyncConfigLocal>>;
  handleAutoSyncChange: (checked: boolean) => void;
  handleIntervalUnitChange: (value: 'minutes' | 'hours') => void;
  handleSyncIntervalChange: (value: string) => void;
  handleSave: () => void;
  isSaving: boolean;
}

const GeneralTab: React.FC<GeneralTabProps> = ({
  config,
  setConfig,
  handleAutoSyncChange,
  handleIntervalUnitChange,
  handleSyncIntervalChange,
  handleSave,
  isSaving
}) => {
  return (
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
    </div>
  );
};

export default GeneralTab;
