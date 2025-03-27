
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { BrandService } from '@/services/BrandService';
import { ProductService } from '@/services/ProductService';
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
  const [sheetData, setSheetData] = useState<any[] | null>(null);
  const [mappedProducts, setMappedProducts] = useState<any[] | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  
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
      
      // Get headers and data for mapping
      const { headers, data } = await GoogleSheetsService.fetchSheetData(
        sheetUrl,
        sheetName,
        headerRowNum - 1 // Adjust for zero-based indexing
      );
      
      // Store headers and data for later use
      setSheetHeaders(headers);
      setSheetData(data);
      setIsValid(true);
      
      console.log('Sheet headers set:', headers);
      console.log('Sheet data retrieved, sample:', data.slice(0, 2));
      
      // Save sheet connection info
      await BrandService.updateGoogleSheetConnection(
        brandId,
        sheetUrl,
        sheetName,
        headerRowNum
      );
      
      // Automatically move to mapping step on successful validation
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
    
    // Map the sheet data to products immediately after mapping is complete
    if (sheetData && mapping && brandId) {
      const products = GoogleSheetsService.mapSheetDataToProducts(
        sheetData,
        sheetHeaders,
        mapping,
        brandId
      );
      setMappedProducts(products);
      console.log(`Mapped ${products.length} products ready for import`);
    } else {
      console.error('Missing data required for product mapping');
    }
    
    setCurrentStep('importing');
  };
  
  const importProducts = async (mapping: SheetMapping) => {
    if (!sheetData || !mapping || !brandId) {
      console.error('Missing data required for import');
      setError('Missing data required for import');
      return;
    }
    
    setImporting(true);
    
    try {
      // If we already have mapped products, use them, otherwise map the data
      const products = mappedProducts || GoogleSheetsService.mapSheetDataToProducts(
        sheetData,
        sheetHeaders,
        mapping,
        brandId
      );
      
      if (!products || products.length === 0) {
        throw new Error('No products were mapped from the sheet');
      }
      
      console.log(`Importing ${products.length} products for brand ${brandId}`);
      
      // Import the products using the product service
      const count = await ProductService.importProductsFromSheet(brandId, products);
      setImportedCount(count);
      
      console.log(`Successfully imported ${count} products`);
      
      // Schedule automatic sync
      try {
        await GoogleSheetsService.scheduleSync(brandId);
        setScheduled(true);
        
        toast({
          title: "Auto-sync scheduled",
          description: "Products will automatically sync with your sheet",
        });
      } catch (syncError) {
        console.error('Error scheduling sync:', syncError);
        // Continue even if sync scheduling fails
      }
      
      toast({
        title: "Import successful",
        description: `${count} products imported successfully`,
      });
      
      setCurrentStep('complete');
      
    } catch (error: any) {
      console.error('Error importing products:', error);
      setError(error.message || 'Failed to import products');
      
      toast({
        title: "Import Failed",
        description: "Could not import products from sheet",
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
    mappedProducts,
    importedCount,
    
    // Actions
    handleUrlChange,
    validateSheet,
    cancelValidation,
    handleMappingComplete,
    importProducts,
    handleOpenSheet
  };
}
