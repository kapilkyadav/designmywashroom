
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadSyncConfigLocal } from '../types';

interface SheetSettingsTabProps {
  config: LeadSyncConfigLocal;
  handleSheetNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleHeaderRowChange: (value: string) => void;
  handleSave: () => void;
  isSaving: boolean;
}

const SheetSettingsTab: React.FC<SheetSettingsTabProps> = ({
  config,
  handleSheetNameChange,
  handleHeaderRowChange,
  handleSave,
  isSaving
}) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default SheetSettingsTab;
