
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileSpreadsheet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BrandService } from '@/services/BrandService';
import { GoogleSheetsService } from '@/services/GoogleSheetsService';
import SheetUrlInput from './SheetUrlInput';
import SheetConfigInputs from './SheetConfigInputs';
import ValidationFeedback from './ValidationFeedback';
import SheetActionButtons from './SheetActionButtons';

interface BrandSheetMappingContainerProps {
  brandId: string;
  onComplete: () => void;
}

const BrandSheetMappingContainer: React.FC<BrandSheetMappingContainerProps> = ({ 
  brandId, 
  onComplete 
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [headerRow, setHeaderRow] = useState('1');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [importing, setImporting] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [error, setError] = useState('');
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSheetUrl(e.target.value);
    setIsValid(null);
    setError('');
  };
  
  // Abort current validation if in progress
  const abortCurrentValidation = () => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
      setValidationTimeout(null);
    }
  };
  
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
      
      setIsValid(true);
      
      await BrandService.updateGoogleSheetConnection(
        brandId,
        sheetUrl,
        sheetName,
        headerRowNum
      );
      
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
  
  const importProducts = async () => {
    if (!isValid) {
      return;
    }
    
    try {
      setImporting(true);
      
      await BrandService.updateGoogleSheetConnection(
        brandId,
        sheetUrl,
        sheetName,
        parseInt(headerRow, 10)
      );
      
      const { headers, data } = await GoogleSheetsService.fetchSheetData(
        sheetUrl,
        sheetName,
        parseInt(headerRow, 10)
      );
      
      const defaultMapping = {
        name: headers.find(h => h.toLowerCase().includes('name')) || '',
        description: headers.find(h => h.toLowerCase().includes('description')) || '',
        category: headers.find(h => h.toLowerCase().includes('category')) || '',
        mrp: headers.find(h => h.toLowerCase().includes('mrp')) || '',
        landing_price: headers.find(h => (h.toLowerCase().includes('landing') && h.toLowerCase().includes('price'))) || '',
        client_price: headers.find(h => (h.toLowerCase().includes('client') && h.toLowerCase().includes('price'))) || '',
        quotation_price: headers.find(h => (h.toLowerCase().includes('quotation') && h.toLowerCase().includes('price'))) || ''
      };
      
      const products = GoogleSheetsService.mapSheetDataToProducts(
        data,
        headers,
        defaultMapping,
        brandId
      );
      
      await GoogleSheetsService.scheduleSync(brandId);
      
      setScheduled(true);
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${products.length} products and scheduled daily sync`,
      });
      
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

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileSpreadsheet className="mr-2 h-5 w-5 text-primary" />
          Connect Google Sheet
        </CardTitle>
        <CardDescription>
          Connect a Google Sheet containing your product data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
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
      </CardContent>
      <CardFooter>
        <SheetActionButtons 
          sheetUrl={sheetUrl}
          validating={validating}
          importing={importing}
          scheduled={scheduled}
          isValid={isValid}
          onValidate={validateSheet}
          onCancel={cancelValidation}
          onImport={importProducts}
          onOpenSheet={handleOpenSheet}
        />
      </CardFooter>
    </Card>
  );
};

export default BrandSheetMappingContainer;
