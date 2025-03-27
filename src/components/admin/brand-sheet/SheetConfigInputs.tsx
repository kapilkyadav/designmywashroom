
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SheetConfigInputsProps {
  sheetName: string;
  headerRow: string;
  onSheetNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHeaderRowChange: (value: string) => void;
}

const SheetConfigInputs: React.FC<SheetConfigInputsProps> = ({
  sheetName,
  headerRow,
  onSheetNameChange,
  onHeaderRowChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="sheetName">Sheet Name</Label>
        <Input
          id="sheetName"
          placeholder="Sheet1"
          value={sheetName}
          onChange={onSheetNameChange}
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          The name of the worksheet tab
        </p>
      </div>
      
      <div>
        <Label htmlFor="headerRow">Header Row</Label>
        <Select 
          value={headerRow} 
          onValueChange={onHeaderRowChange}
        >
          <SelectTrigger>
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
          The row containing column headers
        </p>
      </div>
    </div>
  );
};

export default SheetConfigInputs;
