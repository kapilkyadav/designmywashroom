
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileSpreadsheet, Upload, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BrandService } from '@/services/BrandService';
import { GoogleSheetsService, SheetMapping } from '@/services/GoogleSheetsService';
import SheetUrlInput from './SheetUrlInput';
import SheetConfigInputs from './SheetConfigInputs';
import ValidationFeedback from './ValidationFeedback';
import SheetActionButtons from './SheetActionButtons';
import ColumnMappingInterface from './ColumnMappingInterface';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface BrandSheetMappingContainerProps {
  brandId: string;
  onComplete: () => void;
}

type ImportStep = 'connection' | 'mapping' | 'importing' | 'complete';

const BrandSheetMappingContainer: React.FC<BrandSheetMappingContainerProps> = ({ 
  brandId, 
  onComplete 
}) => {
  // Sheet connection settings
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [headerRow, setHeaderRow] = useState('1');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [importing, setImporting] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [error, setError] = useState('');
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentStep, setCurrentStep] = useState<ImportStep>('connection');
  const [progress, setProgress] = useState(0);
  
  // Sheet data
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<SheetMapping | null>(null);
  
  // Progress steps
  const steps = {
    'connection': 25,
    'mapping': 50,
    'importing': 75,
    'complete': 100
  };
  
  // Update progress bar when step changes
  useEffect(() => {
    setProgress(steps[currentStep]);
  }, [currentStep]);
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSheetUrl(e.target.value);
    setIsValid(null);
    setError('');
  };
  
  // Abort current validation if in progress
  const abortCurrentValidation = useCallback(() => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
      setValidationTimeout(null);
    }
  }, [validationTimeout]);
  
  const validateSheet = async () => {
    if (!sheetUrl.trim()) {
      setError('Sheet URL is required');
      return;
    }
    
    if (!sheetName.trim()) {
      setError('Sheet name is required');
      return;
    }
    
    const headerRowNum = parseInt(headerRow, 10);
    if (isNaN(headerRowNum) || headerRowNum < 1) {
      setError('Header row must be a positive number');
      return;
    }
    
    // Abort any in-progress validation
    abortCurrentValidation();
    
    try {
      setValidating(true);
      setError('');
      setIsValid(null);
      
      // Set a timeout to handle long-running validation
      const timeout = setTimeout(() => {
        setValidating(false);
        setError('Validation timed out. Please check your sheet URL, name, and permissions.');
        setIsValid(false);
      }, 20000); // 20 second timeout
      
      setValidationTimeout(timeout);
      
      // First, try the lighter validation
      const isSheetValid = await GoogleSheetsService.validateSheet(
        sheetUrl,
        sheetName,
        headerRowNum
      );
      
      // Clear the timeout since validation completed
      clearTimeout(timeout);
      setValidationTimeout(null);
      
      if (!isSheetValid) {
        throw new Error('Could not validate sheet. Please check the URL, sheet name, and permissions.');
      }
      
      // Get headers for mapping
      const { headers } = await GoogleSheetsService.fetchSheetData(
        sheetUrl,
        sheetName,
        headerRowNum - 1 // Adjust for zero-based indexing
      );
      
      setSheetHeaders(headers);
      setIsValid(true);
      
      // Save sheet connection info
      await BrandService.updateGoogleSheetConnection(
        brandId,
        sheetUrl,
        sheetName,
        headerRowNum
      );
      
      // Move to mapping step
      setCurrentStep('mapping');
      
      toast({
        title: "Sheet connected",
        description: "Google Sheet successfully connected to the brand",
      });
      
    } catch (error: any) {
      console.error('Sheet validation error:', error);
      setIsValid(false);
      setError(error.message || 'Could not validate sheet. Please check the URL, sheet name, and make sure the sheet is publicly accessible.');
      
      toast({
        title: "Validation Failed",
        description: "Could not connect to the Google Sheet",
        variant: "destructive",
      });
    } finally {
      setValidating(false);
      
      if (validationTimeout) {
        clearTimeout(validationTimeout);
        setValidationTimeout(null);
      }
    }
  };
  
  const cancelValidation = () => {
    if (validating) {
      abortCurrentValidation();
      setValidating(false);
      setError('Validation cancelled');
    }
  };
  
  const handleMappingComplete = (mapping: SheetMapping) => {
    setColumnMapping(mapping);
    importProducts(mapping);
  };
  
  const importProducts = async (mapping: SheetMapping) => {
    if (!isValid || !mapping) {
      return;
    }
    
    try {
      setImporting(true);
      setCurrentStep('importing');
      
      // Fetch sheet data
      const { headers, data } = await GoogleSheetsService.fetchSheetData(
        sheetUrl,
        sheetName,
        parseInt(headerRow, 10) - 1 // Adjust for zero-based indexing
      );
      
      // Map sheet data to products
      const products = GoogleSheetsService.mapSheetDataToProducts(
        data,
        headers,
        mapping,
        brandId
      );
      
      // Schedule daily sync
      await GoogleSheetsService.scheduleSync(brandId);
      
      setScheduled(true);
      setCurrentStep('complete');
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${products.length} products and scheduled daily sync`,
      });
      
      // Complete after a short delay to show the success state
      setTimeout(() => {
        onComplete();
      }, 1500);
      
    } catch (error: any) {
      console.error('Import error:', error);
      setError('Failed to import products from the sheet: ' + (error.message || ''));
      
      toast({
        title: "Import Failed",
        description: "Could not import products from the Google Sheet",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };
  
  const handleOpenSheet = () => {
    if (sheetUrl) {
      window.open(sheetUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const getStepContent = () => {
    switch (currentStep) {
      case 'connection':
        return (
          <div className="space-y-6">
            <SheetUrlInput 
              sheetUrl={sheetUrl} 
              onChange={handleUrlChange} 
              hasError={!!error && !isValid}
            />
            
            <SheetConfigInputs 
              sheetName={sheetName}
              headerRow={headerRow}
              onSheetNameChange={(e) => setSheetName(e.target.value)}
              onHeaderRowChange={setHeaderRow}
            />
            
            <ValidationFeedback isValid={isValid} error={error} />
          </div>
        );
        
      case 'mapping':
        return (
          <ColumnMappingInterface 
            headers={sheetHeaders}
            onMappingComplete={handleMappingComplete}
            isLoading={importing}
          />
        );
        
      case 'importing':
        return (
          <div className="py-10 text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <h3 className="text-lg font-medium">Importing Products</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we import your products and set up the daily sync schedule...
            </p>
          </div>
        );
        
      case 'complete':
        return (
          <div className="py-10 text-center space-y-4">
            <div className="mx-auto flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-medium">Import Complete</h3>
            <p className="text-sm text-muted-foreground">
              Your products have been imported successfully, and a daily sync at 10 AM has been scheduled.
            </p>
          </div>
        );
    }
  };
  
  const getFooterContent = () => {
    switch (currentStep) {
      case 'connection':
        return (
          <SheetActionButtons 
            sheetUrl={sheetUrl}
            validating={validating}
            importing={importing}
            scheduled={scheduled}
            isValid={isValid}
            onValidate={validateSheet}
            onCancel={cancelValidation}
            onImport={() => setCurrentStep('mapping')}
            onOpenSheet={handleOpenSheet}
          />
        );
        
      default:
        return null; // Other steps handle their own actions
    }
  };

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
        {getStepContent()}
      </CardContent>
      {getFooterContent() && (
        <CardFooter>
          {getFooterContent()}
        </CardFooter>
      )}
    </Card>
  );
};

export default BrandSheetMappingContainer;
