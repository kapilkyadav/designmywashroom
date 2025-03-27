
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SheetUrlInputProps {
  sheetUrl: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError: boolean;
}

const SheetUrlInput: React.FC<SheetUrlInputProps> = ({
  sheetUrl,
  onChange,
  hasError,
}) => {
  return (
    <div>
      <Label htmlFor="sheetUrl">Google Sheet URL</Label>
      <div className="mt-1">
        <Input
          id="sheetUrl"
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={sheetUrl}
          onChange={onChange}
          className={`${hasError ? 'border-destructive' : ''}`}
        />
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        The Google Sheet must be accessible to anyone with the link (View only)
      </p>
    </div>
  );
};

export default SheetUrlInput;
