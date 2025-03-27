
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileSpreadsheet } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useSheetImport } from '@/hooks/useSheetImport';
import StepContent from './StepContent';
import FooterContent from './FooterContent';

interface BrandSheetMappingContainerProps {
  brandId: string;
  onComplete: () => void;
}

const BrandSheetMappingContainer: React.FC<BrandSheetMappingContainerProps> = ({ 
  brandId, 
  onComplete 
}) => {
  const {
    // State
    sheetUrl,
    setSheetUrl,
    sheetName,
    setSheetName,
    headerRow,
    setHeaderRow,
    validating,
    isValid,
    importing,
    scheduled,
    error,
    currentStep,
    progress,
    sheetHeaders,
    
    // Actions
    handleUrlChange,
    validateSheet,
    cancelValidation,
    handleMappingComplete,
    handleOpenSheet
  } = useSheetImport({ brandId, onComplete });

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="mr-2 h-5 w-5 text-primary" />
          Import Products from Google Sheet
        </CardTitle>
        <CardDescription>
          Connect and import products from your Google Sheet
        </CardDescription>
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <StepContent 
          currentStep={currentStep}
          sheetUrl={sheetUrl}
          sheetName={sheetName}
          headerRow={headerRow}
          sheetHeaders={sheetHeaders}
          validating={validating}
          importing={importing}
          scheduled={scheduled}
          isValid={isValid}
          error={error}
          onUrlChange={handleUrlChange}
          onSheetNameChange={(e) => setSheetName(e.target.value)}
          onHeaderRowChange={setHeaderRow}
          onValidate={validateSheet}
          onCancel={cancelValidation}
          onImport={() => {}}
          onOpenSheet={handleOpenSheet}
          onMappingComplete={handleMappingComplete}
        />
      </CardContent>
      <CardFooter>
        <FooterContent 
          currentStep={currentStep}
          sheetUrl={sheetUrl}
          validating={validating}
          importing={importing}
          scheduled={scheduled}
          isValid={isValid}
          onValidate={validateSheet}
          onCancel={cancelValidation}
          onImport={() => currentStep === 'connection' && isValid ? setHeaderRow(headerRow) : null}
          onOpenSheet={handleOpenSheet}
        />
      </CardFooter>
    </Card>
  );
};

export default BrandSheetMappingContainer;
