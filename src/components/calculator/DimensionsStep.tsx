
import React, { useState, useEffect } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const DimensionsStep = () => {
  const { state, setDimensions, nextStep, prevStep } = useCalculator();
  
  // Use the state values, or empty strings if they're zero
  const initialLength = state.dimensions.length > 0 ? state.dimensions.length.toString() : '';
  const initialWidth = state.dimensions.width > 0 ? state.dimensions.width.toString() : '';
  
  const [length, setLength] = useState(initialLength);
  const [width, setWidth] = useState(initialWidth);
  const [errors, setErrors] = useState({ length: '', width: '' });
  const [showPreview, setShowPreview] = useState(false);

  // Calculate the aspect ratio for the preview
  const aspectRatio = width && length ? parseFloat(width) / parseFloat(length) : 1;
  const isValidRatio = !isNaN(aspectRatio) && isFinite(aspectRatio);
  const previewWidth = 240; // max width for preview
  const previewHeight = isValidRatio ? previewWidth * aspectRatio : previewWidth;

  // Update errors when inputs change
  useEffect(() => {
    const newErrors = { length: '', width: '' };
    
    if (length && (isNaN(parseFloat(length)) || parseFloat(length) <= 0)) {
      newErrors.length = 'Please enter a valid positive number';
    }
    
    if (width && (isNaN(parseFloat(width)) || parseFloat(width) <= 0)) {
      newErrors.width = 'Please enter a valid positive number';
    }
    
    setErrors(newErrors);
    
    // Show preview if both values are valid
    if (
      parseFloat(length) > 0 && 
      parseFloat(width) > 0 && 
      !isNaN(parseFloat(length)) && 
      !isNaN(parseFloat(width))
    ) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [length, width]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!length || !width || errors.length || errors.width) {
      // Show validation messages
      const newErrors = { ...errors };
      if (!length) newErrors.length = 'Length is required';
      if (!width) newErrors.width = 'Width is required';
      setErrors(newErrors);
      return;
    }

    const lengthNum = parseFloat(length);
    const widthNum = parseFloat(width);
    
    console.log("Submitting dimensions:", {length: lengthNum, width: widthNum});
    
    setDimensions({
      length: lengthNum,
      width: widthNum
    });
    nextStep();
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center">What are the dimensions of your washroom?</h2>
      <p className="text-muted-foreground mb-8 text-center">
        Enter the length and width in feet. The height is fixed at 9 feet.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="length" className="text-base">
                  Length (feet)
                </Label>
                <Input
                  id="length"
                  type="number"
                  placeholder="Enter length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className={`mt-1 text-lg h-12 ${errors.length ? 'border-destructive' : ''}`}
                  min="0"
                  step="0.01"
                />
                {errors.length && (
                  <p className="text-destructive text-sm mt-1">{errors.length}</p>
                )}
              </div>

              <div>
                <Label htmlFor="width" className="text-base">
                  Width (feet)
                </Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="Enter width"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className={`mt-1 text-lg h-12 ${errors.width ? 'border-destructive' : ''}`}
                  min="0"
                  step="0.01"
                />
                {errors.width && (
                  <p className="text-destructive text-sm mt-1">{errors.width}</p>
                )}
              </div>

              <div>
                <Label htmlFor="height" className="text-base">
                  Height (feet)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value="9"
                  disabled
                  className="mt-1 text-lg h-12 bg-muted/50"
                />
                <p className="text-muted-foreground text-sm mt-1">
                  Fixed at 9 feet as per standard
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
              >
                Back
              </Button>
              <Button type="submit">Continue</Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col items-center justify-center">
          {showPreview ? (
            <div className="w-full">
              <h3 className="text-lg font-medium mb-4 text-center">Room Preview</h3>
              <Card className="mx-auto p-4 flex items-center justify-center bg-secondary/50">
                <div
                  className="relative bg-primary/5 border-2 border-primary/30 rounded-md flex items-center justify-center"
                  style={{ 
                    width: `${previewWidth}px`,
                    height: `${previewHeight}px`,
                    maxHeight: '240px'
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-muted-foreground whitespace-nowrap">
                    {length} × {width} ft
                  </div>
                  
                  {/* Length Annotation */}
                  <div className="absolute -top-6 left-0 w-full flex justify-center">
                    <div className="flex items-center">
                      <div className="h-6 border-l border-primary/40"></div>
                      <div className="w-full border-t border-primary/40"></div>
                      <div className="h-6 border-r border-primary/40"></div>
                    </div>
                  </div>
                  <div className="absolute -top-3 text-xs text-muted-foreground">
                    {length} ft
                  </div>
                  
                  {/* Width Annotation */}
                  <div className="absolute top-0 -left-6 h-full flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="w-6 border-t border-primary/40"></div>
                      <div className="h-full border-l border-primary/40"></div>
                      <div className="w-6 border-b border-primary/40"></div>
                    </div>
                  </div>
                  <div className="absolute -left-3 text-xs text-muted-foreground" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                    {width} ft
                  </div>
                </div>
              </Card>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Floor Area:</span> {(parseFloat(length) * parseFloat(width)).toFixed(2)} sq ft
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold">Wall Area:</span> {(2 * (parseFloat(length) + parseFloat(width)) * 9).toFixed(2)} sq ft
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold">Total Area:</span> {(parseFloat(length) * parseFloat(width) + 2 * (parseFloat(length) + parseFloat(width)) * 9).toFixed(2)} sq ft
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-48 h-48 mx-auto border-2 border-dashed border-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground text-sm px-4">
                  Enter valid dimensions to see a preview of your washroom
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DimensionsStep;
