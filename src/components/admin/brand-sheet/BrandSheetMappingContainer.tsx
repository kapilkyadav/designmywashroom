
import React, { useState } from 'react';
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
import { toast } from '@/hooks/use-toast';
import { useSheetImport } from '@/hooks/useSheetImport';
import StepContent from './StepContent';
import FooterContent from './FooterContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface BrandSheetMappingContainerProps {
  brandId: string;
  onComplete: () => void;
}

const BrandSheetMappingContainer: React.FC<BrandSheetMappingContainerProps> = ({ 
  brandId, 
  onComplete 
}) => {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
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
    setCurrentStep,
    progress,
    sheetHeaders,
    mappedProducts,
    importedCount,
    
    // Actions
    handleUrlChange,
    validateSheet,
    cancelValidation,
    handleMappingComplete,
    importProducts,
    handleOpenSheet
  } = useSheetImport({ brandId, onComplete });

  const handleImportComplete = () => {
    toast({
      title: "Import Complete",
      description: "Products imported successfully",
    });
    onComplete();
  };

  const handleImportError = (error: Error) => {
    console.error('Import error:', error);
    setErrorMessage(error.message || 'An error occurred during import');
    setShowErrorDialog(true);
    toast({
      title: "Import Failed",
      description: "Could not import products from sheet",
      variant: "destructive",
    });
  };

  const handleProductMapping = (mapping: any) => {
    console.log('Mapping complete, starting import', mapping);
    
    // When moving to importing step, we don't need to call importProducts again
    // The ImportingStep component will handle the actual import process
    
    // Let the hook handle the step change
    handleMappingComplete(mapping);
  };

  // Create a wrapper function that doesn't require parameters
  const handleImportAction = () => {
    // This is only called from the footer when on the connection step
    if (currentStep === 'connection' && isValid) {
      // Proceed to the next step after validation
      setCurrentStep('mapping');
    }
  };

  return (
    <>
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
            brandId={brandId}
            products={mappedProducts}
            importedCount={importedCount}
            onUrlChange={handleUrlChange}
            onSheetNameChange={(e) => setSheetName(e.target.value)}
            onHeaderRowChange={setHeaderRow}
            onValidate={validateSheet}
            onCancel={cancelValidation}
            onImport={handleImportAction}
            onOpenSheet={handleOpenSheet}
            onMappingComplete={handleProductMapping}
            onImportComplete={handleImportComplete}
            onImportError={handleImportError}
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
            onImport={handleImportAction}
            onOpenSheet={handleOpenSheet}
          />
        </CardFooter>
      </Card>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Error</DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <button 
              onClick={() => setShowErrorDialog(false)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BrandSheetMappingContainer;
