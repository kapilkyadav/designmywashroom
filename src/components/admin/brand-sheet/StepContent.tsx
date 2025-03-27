
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
  brandId?: string;
  products?: any[];
  importedCount?: number;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSheetNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHeaderRowChange: (value: string) => void;
  onValidate: () => void;
  onCancel: () => void;
  onImport: () => void;
  onOpenSheet: () => void;
  onMappingComplete: (mapping: SheetMapping) => void;
  onImportComplete?: () => void;
  onImportError?: (error: Error) => void;
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
  brandId,
  products,
  importedCount,
  onUrlChange,
  onSheetNameChange,
  onHeaderRowChange,
  onValidate,
  onCancel,
  onImport,
  onOpenSheet,
  onMappingComplete,
  onImportComplete,
  onImportError
}) => {
  // Debug to track step transitions
  console.log('Rendering StepContent for step:', currentStep, 'with headers:', sheetHeaders);

  // Safeguard to prevent rendering mapping interface without headers
  if (currentStep === 'mapping' && (!sheetHeaders || sheetHeaders.length === 0)) {
    console.error('Attempted to render mapping step without headers');
    return (
      <div className="p-4 border rounded bg-destructive/10 text-destructive">
        <p>Error: No sheet headers available. Please try validating the sheet again.</p>
        <button 
          onClick={onValidate}
          className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded"
        >
          Re-validate Sheet
        </button>
      </div>
    );
  }

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
      return (
        <ImportingStep 
          brandId={brandId}
          products={products}
          onComplete={onImportComplete}
          onError={onImportError}
        />
      );
      
    case 'complete':
      return <CompleteStep importedCount={importedCount} brandId={brandId} />;
      
    default:
      return null;
  }
};

export default StepContent;
