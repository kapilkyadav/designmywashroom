
import React from 'react';
import { ImportStep } from '@/hooks/useSheetImport';
import ConnectionStep from './ConnectionStep';
import ColumnMappingInterface from './ColumnMappingInterface';
import ImportingStep from './ImportingStep';
import CompleteStep from './CompleteStep';
import { SheetMapping } from '@/services/GoogleSheetsService';

interface StepContentProps {
  currentStep: ImportStep;
  sheetUrl: string;
  sheetName: string;
  headerRow: string;
  sheetHeaders: string[];
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
  onMappingComplete: (mapping: SheetMapping) => void;
}

const StepContent: React.FC<StepContentProps> = ({
  currentStep,
  sheetUrl,
  sheetName,
  headerRow,
  sheetHeaders,
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
  onOpenSheet,
  onMappingComplete
}) => {
  switch (currentStep) {
    case 'connection':
      return (
        <ConnectionStep 
          sheetUrl={sheetUrl}
          sheetName={sheetName}
          headerRow={headerRow}
          validating={validating}
          importing={importing}
          scheduled={scheduled}
          isValid={isValid}
          error={error}
          onUrlChange={onUrlChange}
          onSheetNameChange={onSheetNameChange}
          onHeaderRowChange={onHeaderRowChange}
          onValidate={onValidate}
          onCancel={onCancel}
          onImport={onImport}
          onOpenSheet={onOpenSheet}
        />
      );
      
    case 'mapping':
      return (
        <ColumnMappingInterface 
          headers={sheetHeaders}
          onMappingComplete={onMappingComplete}
          isLoading={importing}
        />
      );
      
    case 'importing':
      return <ImportingStep />;
      
    case 'complete':
      return <CompleteStep />;
      
    default:
      return null;
  }
};

export default StepContent;
