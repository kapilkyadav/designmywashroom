
import React from 'react';
import { ImportStep } from '@/hooks/useSheetImport';
import SheetActionButtons from './SheetActionButtons';

interface FooterContentProps {
  currentStep: ImportStep;
  sheetUrl: string;
  validating: boolean;
  importing: boolean;
  scheduled: boolean;
  isValid: boolean | null;
  onValidate: () => void;
  onCancel: () => void;
  onImport: () => void;
  onOpenSheet: () => void;
}

const FooterContent: React.FC<FooterContentProps> = ({
  currentStep,
  sheetUrl,
  validating,
  importing,
  scheduled,
  isValid,
  onValidate,
  onCancel,
  onImport,
  onOpenSheet
}) => {
  if (currentStep !== 'connection') {
    return null;
  }
  
  return (
    <SheetActionButtons 
      sheetUrl={sheetUrl}
      validating={validating}
      importing={importing}
      scheduled={scheduled}
      isValid={isValid}
      onValidate={onValidate}
      onCancel={onCancel}
      onImport={onImport}
      onOpenSheet={onOpenSheet}
    />
  );
};

export default FooterContent;
