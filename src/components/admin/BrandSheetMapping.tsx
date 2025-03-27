
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandService } from '@/services/BrandService';
import { ProductService } from '@/services/ProductService';
import { GoogleSheetsService, SheetMapping } from '@/services/GoogleSheetsService';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface BrandSheetMappingProps {
  brandId: string;
  onComplete: () => void;
}

const BrandSheetMapping = ({ brandId, onComplete }: BrandSheetMappingProps) => {
  const [step, setStep] = useState<'url' | 'headers' | 'mapping' | 'preview'>('url');
  const [isLoading, setIsLoading] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [headerRow, setHeaderRow] = useState(0);
  const [sheetData, setSheetData] = useState<{ headers: string[], data: any[] }>({ headers: [], data: [] });
  const [mapping, setMapping] = useState<SheetMapping>({
    name: '',
    description: '',
    category: '',
    mrp: '',
    landing_price: '',
    client_price: '',
    quotation_price: ''
  });
  const [previewProducts, setPreviewProducts] = useState<any[]>([]);

  const handleFetchSheet = async () => {
    if (!sheetUrl) {
      toast({
        title: "Sheet URL required",
        description: "Please enter a valid Google Sheet URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Save sheet info to brand
      await BrandService.updateGoogleSheetConnection(
        brandId, 
        sheetUrl, 
        sheetName, 
        parseInt(headerRow.toString())
      );
      
      // Fetch headers and sample data
      const data = await GoogleSheetsService.fetchSheetData(
        sheetUrl,
        sheetName,
        parseInt(headerRow.toString())
      );
      
      setSheetData(data);
      setStep('headers');
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      toast({
        title: "Error fetching sheet",
        description: "Could not fetch data from the provided Google Sheet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMappingChange = (field: keyof SheetMapping, value: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreviewMapping = () => {
    // Validate that required fields are mapped
    if (!mapping.name || !mapping.landing_price || !mapping.quotation_price) {
      toast({
        title: "Required fields missing",
        description: "Name, Landing Price, and Quotation Price columns must be mapped",
        variant: "destructive",
      });
      return;
    }

    // Map the data using the selected mappings
    const products = GoogleSheetsService.mapSheetDataToProducts(
      sheetData.data,
      sheetData.headers,
      mapping,
      brandId
    );
    
    setPreviewProducts(products.slice(0, 5)); // Show first 5 products for preview
    setStep('preview');
  };

  const handleImport = async () => {
    try {
      setIsLoading(true);
      
      // Map all data using the selected mappings
      const products = GoogleSheetsService.mapSheetDataToProducts(
        sheetData.data,
        sheetData.headers,
        mapping,
        brandId
      );
      
      // Import the products
      const importCount = await ProductService.importProductsFromSheet(brandId, products);
      
      // Set up daily sync
      await GoogleSheetsService.scheduleSync(brandId);
      
      toast({
        title: "Import successful",
        description: `${importCount} products imported successfully and daily sync scheduled`,
      });
      
      onComplete();
    } catch (error) {
      console.error('Error importing products:', error);
      toast({
        title: "Import failed",
        description: "Failed to import products from sheet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 'url':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Connect Google Sheet</CardTitle>
              <CardDescription>
                Enter the URL of the Google Sheet containing your product data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sheetUrl">Google Sheet URL</Label>
                <Input
                  id="sheetUrl"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheetName">Sheet Name</Label>
                <Input
                  id="sheetName"
                  placeholder="Sheet1"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the name of the specific worksheet tab (default: Sheet1)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="headerRow">Header Row</Label>
                <Input
                  id="headerRow"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={headerRow}
                  onChange={(e) => setHeaderRow(parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the row number that contains your column headers (starting at 0)
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleFetchSheet} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Sheet"
                )}
              </Button>
            </CardFooter>
          </Card>
        );

      case 'headers':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Map Sheet Columns</CardTitle>
              <CardDescription>
                Map columns from your Google Sheet to product fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sheetData.headers.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No headers found in the sheet at the specified row
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameColumn">Product Name <span className="text-red-500">*</span></Label>
                    <Select value={mapping.name} onValueChange={(value) => handleMappingChange('name', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {sheetData.headers.map((header) => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="descriptionColumn">Description</Label>
                    <Select value={mapping.description} onValueChange={(value) => handleMappingChange('description', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {sheetData.headers.map((header) => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="categoryColumn">Category</Label>
                    <Select value={mapping.category} onValueChange={(value) => handleMappingChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {sheetData.headers.map((header) => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mrpColumn">MRP</Label>
                    <Select value={mapping.mrp} onValueChange={(value) => handleMappingChange('mrp', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {sheetData.headers.map((header) => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="landingPriceColumn">Landing Price <span className="text-red-500">*</span></Label>
                    <Select value={mapping.landing_price} onValueChange={(value) => handleMappingChange('landing_price', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {sheetData.headers.map((header) => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientPriceColumn">Client Price</Label>
                    <Select value={mapping.client_price} onValueChange={(value) => handleMappingChange('client_price', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {sheetData.headers.map((header) => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quotationPriceColumn">Quotation Price <span className="text-red-500">*</span></Label>
                    <Select value={mapping.quotation_price} onValueChange={(value) => handleMappingChange('quotation_price', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {sheetData.headers.map((header) => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('url')}>
                Back
              </Button>
              <Button onClick={handlePreviewMapping} disabled={isLoading || sheetData.headers.length === 0}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Preview Mapping
              </Button>
            </CardFooter>
          </Card>
        );

      case 'preview':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Preview Products</CardTitle>
              <CardDescription>
                Review sample products before importing (showing first 5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewProducts.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No valid products found with the current mapping
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-secondary">
                            <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">Name</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">Category</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">MRP</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">Landing Price</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">Client Price</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">Quotation Price</th>
                            <th className="px-3 py-2 text-left text-sm font-medium text-muted-foreground">Margin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewProducts.map((product, index) => (
                            <tr key={index} className="border-t hover:bg-secondary/50">
                              <td className="px-3 py-2 font-medium">{product.name}</td>
                              <td className="px-3 py-2 text-sm">{product.category || '-'}</td>
                              <td className="px-3 py-2 text-sm">₹{product.mrp.toFixed(2)}</td>
                              <td className="px-3 py-2 text-sm">₹{product.landing_price.toFixed(2)}</td>
                              <td className="px-3 py-2 text-sm">₹{product.client_price.toFixed(2)}</td>
                              <td className="px-3 py-2 text-sm">₹{product.quotation_price.toFixed(2)}</td>
                              <td className="px-3 py-2 text-sm">{product.margin.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total products to import: {sheetData.data.length}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('headers')}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={isLoading || previewProducts.length === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import Products"
                )}
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderStep()}
    </div>
  );
};

export default BrandSheetMapping;
