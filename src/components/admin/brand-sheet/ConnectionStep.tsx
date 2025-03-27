
import React from 'react';
import { ImportStep } from '@/hooks/useSheetImport';
import ValidationFeedback from './ValidationFeedback';
import SheetUrlInput from './SheetUrlInput';
import SheetConfigInputs from './SheetConfigInputs';
import SheetActionButtons from './SheetActionButtons';

interface ConnectionStepProps {
  sheetUrl: string;
  sheetName: string;
  headerRow: string;
  validating: boolean;
  importing: boolean;
  scheduled: boolean;
  isValid: boolean | null;
  error: string;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSheetNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHeaderRowChange: (value: string) => void;
  onValidate: () => void;
  onCancel: () => void;
  onImport: () => void;
  onOpenSheet: () => void;
}

const ConnectionStep: React.FC<ConnectionStepProps> = ({
  sheetUrl,
  sheetName,
  headerRow,
  validating,
  importing,
  scheduled,
  isValid,
  error,
  onUrlChange,
  onSheetNameChange,
  onHeaderRowChange,
  onValidate,
  onCancel,
  onImport,
  onOpenSheet
}) => {
  return (
    <div className="space-y-6">
      <SheetUrlInput 
        sheetUrl={sheetUrl} 
        onChange={onUrlChange} 
        hasError={!!error && !isValid}
      />
      
      <SheetConfigInputs 
        sheetName={sheetName}
        headerRow={headerRow}
        onSheetNameChange={onSheetNameChange}
        onHeaderRowChange={onHeaderRowChange}
      />
      
      <ValidationFeedback isValid={isValid} error={error} />
    </div>
  );
};

export default ConnectionStep;
