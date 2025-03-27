
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { BrandService } from '@/services/BrandService';
import { GoogleSheetsService } from '@/services/GoogleSheetsService';
import { 
  FileSpreadsheet, 
  Loader2, 
  RefreshCcw,
  AlertCircle,
  ExternalLink,
  Check,
  XCircle 
} from 'lucide-react';

interface BrandSheetMappingProps {
  brandId: string;
  onComplete: () => void;
}

const BrandSheetMapping: React.FC<BrandSheetMappingProps> = ({ 
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
          <div>
            <Label htmlFor="sheetUrl">Google Sheet URL</Label>
            <div className="mt-1">
              <Input
                id="sheetUrl"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={handleUrlChange}
                className={`${error && !isValid ? 'border-destructive' : ''}`}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              The Google Sheet must be accessible to anyone with the link (View only)
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sheetName">Sheet Name</Label>
              <Input
                id="sheetName"
                placeholder="Sheet1"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                The name of the worksheet tab
              </p>
            </div>
            
            <div>
              <Label htmlFor="headerRow">Header Row</Label>
              <Select 
                value={headerRow} 
                onValueChange={setHeaderRow}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select header row" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Row {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                The row containing column headers
              </p>
            </div>
          </div>
          
          {error && !isValid && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {isValid && (
            <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md p-3 flex items-start">
              <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm">Sheet validated successfully! You can now import products.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button 
          variant="outline"
          type="button"
          onClick={() => {
            if (sheetUrl) {
              window.open(sheetUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          disabled={!sheetUrl}
          className="w-full sm:w-auto"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Sheet
        </Button>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {validating ? (
            <Button
              type="button"
              variant="destructive"
              onClick={cancelValidation}
              className="flex-1 sm:flex-auto"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={validateSheet}
              disabled={validating || importing || !sheetUrl || !sheetName}
              className="flex-1 sm:flex-auto"
            >
              {validating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate'
              )}
            </Button>
          )}
          
          <Button
            type="button"
            onClick={importProducts}
            disabled={!isValid || importing || scheduled}
            className="flex-1 sm:flex-auto"
          >
            {scheduled ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Scheduled
              </>
            ) : importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Import & Schedule
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BrandSheetMapping;
