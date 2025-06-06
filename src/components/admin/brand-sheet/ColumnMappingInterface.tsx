
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, AlertCircle } from 'lucide-react';

export interface ColumnMapping {
  name: string;
  description: string;
  category: string;
  finish_color: string;
  series: string;
  model_code: string;
  size: string;
  mrp: string;
  landing_price: string;
  client_price: string;
  quotation_price: string;
  quantity: string;
}

interface ColumnMappingInterfaceProps {
  headers: string[];
  initialMapping?: Partial<ColumnMapping>;
  onMappingComplete: (mapping: ColumnMapping) => void;
  isLoading?: boolean;
}

const ColumnMappingInterface: React.FC<ColumnMappingInterfaceProps> = ({
  headers,
  initialMapping = {},
  onMappingComplete,
  isLoading = false
}) => {
  // Filter out any empty headers to prevent empty values being passed to SelectItem
  const validHeaders = headers.filter(header => header && header.trim() !== '');
  
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({
    ...initialMapping
  });
  
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  
  // Required fields that must be mapped
  const requiredFields = ['name', 'landing_price', 'quotation_price'];
  
  // Validate mapping on change
  useEffect(() => {
    const hasMissingRequiredFields = requiredFields.some(field => {
      const value = mapping[field as keyof ColumnMapping];
      return !value || value === '';
    });
    
    console.log('Validating mapping:', mapping);
    console.log('Missing required fields?', hasMissingRequiredFields);
    
    setIsValid(!hasMissingRequiredFields);
  }, [mapping]);
  
  // Auto-detect fields from headers (best-effort matching) - only once
  useEffect(() => {
    if (validHeaders.length > 0 && !autoDetected) {
      const detectedMapping: Partial<ColumnMapping> = {};
      
      // Try to match common naming patterns
      validHeaders.forEach(header => {
        const headerLower = header.toLowerCase();
        
        if (headerLower.includes('name') || headerLower.includes('product')) {
          detectedMapping.name = header;
        } else if (headerLower.includes('desc')) {
          detectedMapping.description = header;
        } else if (headerLower.includes('categ') || headerLower.includes('area')) {
          detectedMapping.category = header;
        } else if (headerLower.includes('finish') || headerLower.includes('color')) {
          detectedMapping.finish_color = header;
        } else if (headerLower.includes('series')) {
          detectedMapping.series = header;
        } else if (headerLower.includes('model') || headerLower.includes('code')) {
          detectedMapping.model_code = header;
        } else if (headerLower.includes('size')) {
          detectedMapping.size = header;
        } else if (headerLower.includes('mrp')) {
          detectedMapping.mrp = header;
        } else if ((headerLower.includes('land') && headerLower.includes('price')) || 
                  headerLower.includes('offer') || headerLower.includes('yds offer')) {
          detectedMapping.landing_price = header;
        } else if (headerLower.includes('client') && headerLower.includes('price')) {
          detectedMapping.client_price = header;
        } else if (headerLower.includes('quot') || headerLower.includes('yds price')) {
          detectedMapping.quotation_price = header;
        } else if (headerLower.includes('qty') || headerLower.includes('quant') || headerLower.includes('amount')) {
          detectedMapping.quantity = header;
        }
      });
      
      console.log('Auto-detected mapping:', detectedMapping);
      
      // Apply initial mapping on top of detected mapping if provided
      if (Object.keys(initialMapping).length > 0) {
        setMapping({...detectedMapping, ...initialMapping});
      } else {
        setMapping(detectedMapping);
      }
      
      setAutoDetected(true);
    }
  }, [validHeaders, initialMapping, autoDetected]);
  
  const handleFieldChange = (field: keyof ColumnMapping, value: string) => {
    // Ensure we never set an empty string as a value - use null or a valid placeholder
    const newValue = value === "none" ? "" : value;
    
    setMapping(prev => {
      const newMapping = {
        ...prev,
        [field]: newValue
      };
      
      console.log(`Field ${field} changed to "${newValue}"`, newMapping);
      return newMapping;
    });
  };
  
  const handleSaveMapping = async () => {
    // Only proceed if we have all the required fields
    if (isValid) {
      try {
        setLoading(true);
        
        // For non-required fields that weren't mapped, use empty strings
        const completeMapping: ColumnMapping = {
          name: mapping.name || '',
          description: mapping.description || '',
          category: mapping.category || '',
          finish_color: mapping.finish_color || '',
          series: mapping.series || '',
          model_code: mapping.model_code || '',
          size: mapping.size || '',
          mrp: mapping.mrp || '',
          landing_price: mapping.landing_price || '',
          client_price: mapping.client_price || '',
          quotation_price: mapping.quotation_price || '',
          quantity: mapping.quantity || ''
        };
        
        console.log('Saving mapping:', completeMapping);
        
        // Allow the save operation to complete visually
        setTimeout(() => {
          onMappingComplete(completeMapping);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error saving mapping:', error);
        setLoading(false);
      }
    } else {
      console.warn('Cannot save mapping - validation failed');
    }
  };
  
  if (validHeaders.length === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No valid headers found in the sheet. Please make sure the sheet contains headers.
        </AlertDescription>
      </Alert>
    );
  }
  
  console.log('Current mapping state:', mapping);
  console.log('Is valid?', isValid);
  console.log('Button disabled?', !isValid || isLoading || loading);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Map Sheet Columns to Product Fields</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Map each column from your sheet to the corresponding product field. 
          <span className="text-destructive font-medium"> * Required fields</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Product Name <span className="text-destructive">*</span>
            </label>
            <Select
              value={mapping.name || ""}
              onValueChange={(value) => handleFieldChange('name', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Category/Area
            </label>
            <Select
              value={mapping.category || ""}
              onValueChange={(value) => handleFieldChange('category', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description
            </label>
            <Select
              value={mapping.description || ""}
              onValueChange={(value) => handleFieldChange('description', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Finish/Color
            </label>
            <Select
              value={mapping.finish_color || ""}
              onValueChange={(value) => handleFieldChange('finish_color', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Series
            </label>
            <Select
              value={mapping.series || ""}
              onValueChange={(value) => handleFieldChange('series', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Model/Code
            </label>
            <Select
              value={mapping.model_code || ""}
              onValueChange={(value) => handleFieldChange('model_code', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Size
            </label>
            <Select
              value={mapping.size || ""}
              onValueChange={(value) => handleFieldChange('size', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              MRP
            </label>
            <Select
              value={mapping.mrp || ""}
              onValueChange={(value) => handleFieldChange('mrp', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Landing Price <span className="text-destructive">*</span>
            </label>
            <Select
              value={mapping.landing_price || ""}
              onValueChange={(value) => handleFieldChange('landing_price', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Client Price
            </label>
            <Select
              value={mapping.client_price || ""}
              onValueChange={(value) => handleFieldChange('client_price', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Quotation Price <span className="text-destructive">*</span>
            </label>
            <Select
              value={mapping.quotation_price || ""}
              onValueChange={(value) => handleFieldChange('quotation_price', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Quantity
            </label>
            <Select
              value={mapping.quantity || ""}
              onValueChange={(value) => handleFieldChange('quantity', value)}
              disabled={isLoading || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {validHeaders.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end">
          <Button 
            onClick={handleSaveMapping} 
            disabled={!isValid || isLoading || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Mapping & Continue
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColumnMappingInterface;
