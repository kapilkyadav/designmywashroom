
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { BrandService } from '@/services/BrandService';
import { GoogleSheetsService, SheetMapping } from '@/services/GoogleSheetsService';

export type ImportStep = 'connection' | 'mapping' | 'importing' | 'complete';

interface UseSheetImportProps {
  brandId: string;
  onComplete: () => void;
}

export function useSheetImport({ brandId, onComplete }: UseSheetImportProps) {
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
    setCurrentStep('importing');
  };
  
  const handleOpenSheet = () => {
    if (sheetUrl) {
      window.open(sheetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return {
    // State
    sheetUrl,
    setSheetUrl,
    sheetName,
    setSheetName,
    headerRow,
    setHeaderRow,
    loading,
    validating,
    isValid,
    importing,
    scheduled,
    error,
    currentStep,
    setCurrentStep,
    progress,
    sheetHeaders,
    
    // Actions
    handleUrlChange,
    validateSheet,
    cancelValidation,
    handleMappingComplete,
    handleOpenSheet
  };
}
