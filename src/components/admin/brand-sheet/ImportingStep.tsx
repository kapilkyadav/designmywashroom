
import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ProductService } from '@/services/ProductService';

interface ImportingStepProps {
  brandId?: string;
  products?: any[];
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

const ImportingStep: React.FC<ImportingStepProps> = ({ 
  brandId, 
  products,
  onComplete,
  onError 
}) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  // Use a ref to track if import has been initiated
  const importStartedRef = useRef(false);

  // One-time import effect that won't be affected by re-renders
  useEffect(() => {
    // Skip if already importing, completed, or the ref indicates we've started
    if (isImporting || importComplete || importStartedRef.current) {
      console.log('Import already in progress or completed, skipping');
      return;
    }
    
    // Immediately mark as started to prevent concurrent calls
    importStartedRef.current = true;
    console.log('Starting import process, setting importStartedRef to true');
    
    const importProducts = async () => {
      // Validate inputs before proceeding
      if (!brandId || !products || products.length === 0) {
        const errorMessage = 'No products to import or missing brand ID';
        console.error(errorMessage);
        setError(errorMessage);
        onError?.(new Error(errorMessage));
        return;
      }

      try {
        setIsImporting(true);
        
        // Start the import process
        console.log(`Importing ${products.length} products for brand ${brandId}`);
        setProgress(10);

        // Import the products
        const importedCount = await ProductService.importProductsFromSheet(brandId, products);
        setProgress(90);

        console.log(`Successfully imported ${importedCount} products`);
        toast({
          title: "Import Successful",
          description: `Successfully imported ${importedCount} products for the brand.`,
        });

        // Set a small delay before completing to ensure the UI transitions smoothly
        setTimeout(() => {
          setProgress(100);
          setImportComplete(true); // Mark import as complete
          onComplete?.();
        }, 1000);
      } catch (error) {
        console.error('Error importing products:', error);
        setError(`Failed to import products: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast({
          title: "Import Failed",
          description: `There was an error importing the products. Please try again.`,
          variant: "destructive",
        });
        onError?.(error instanceof Error ? error : new Error('Unknown error during import'));
      } finally {
        setIsImporting(false);
      }
    };

    // Execute the import
    importProducts();
    
    // This cleanup ensures the ref stays true if component remounts
    return () => {
      console.log('Component unmounting, keeping importStartedRef true');
    };
  }, []); // Empty dependency array ensures this only runs once on mount

  if (error) {
    return (
      <div className="py-10 text-center space-y-4">
        <div className="mx-auto flex items-center justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h3 className="text-lg font-medium">Import Failed</h3>
        <p className="text-sm text-muted-foreground">
          {error}
        </p>
        <p className="text-sm">
          Please go back and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="py-10 text-center space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      <h3 className="text-lg font-medium">Importing Products</h3>
      <p className="text-sm text-muted-foreground">
        Please wait while we import your products and set up the daily sync schedule...
      </p>
      <div className="w-full bg-muted rounded-full h-2.5 mt-2">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-muted-foreground">
        {progress}% complete
      </p>
    </div>
  );
};

export default ImportingStep;
