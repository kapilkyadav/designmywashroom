import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Washroom } from '@/services/real-projects/types';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InternalPricingProps {
  washrooms: Washroom[];
  onMarginsChange: (margins: Record<string, number>) => void;
  onGstRateChange: (rate: number) => void;
  onInternalPricingToggle: (enabled: boolean) => void;
  internalPricing: boolean;
  margins: Record<string, number>;
  gstRate: number;
  internalPricingDetails?: Record<string, any>;
}

const formatAmount = (value: number): string => {
  return value.toLocaleString('en-IN', { 
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
};

const InternalPricingSection: React.FC<InternalPricingProps> = ({
  washrooms,
  onMarginsChange,
  onGstRateChange,
  onInternalPricingToggle,
  internalPricing,
  margins,
  gstRate,
  internalPricingDetails
}) => {
  const [localMargins, setLocalMargins] = useState<Record<string, number>>(margins || {});
  const [useUniformMargin, setUseUniformMargin] = useState<boolean>(false);
  const [uniformMargin, setUniformMargin] = useState<number>(0);

  // Initialize margins for all washrooms if not already present
  useEffect(() => {
    const initializedMargins = { ...localMargins };
    let hasUpdates = false;

    washrooms.forEach(washroom => {
      if (initializedMargins[washroom.id] === undefined) {
        initializedMargins[washroom.id] = 0;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      setLocalMargins(initializedMargins);
      onMarginsChange(initializedMargins);
    }
  }, [washrooms]);

  // Update local margins when prop margins change
  useEffect(() => {
    setLocalMargins(margins);
  }, [margins]);

  const handleMarginChange = (washroomId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newMargins = { ...localMargins, [washroomId]: numValue };
    setLocalMargins(newMargins);
    onMarginsChange(newMargins);
  };

  const handleGstRateChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    onGstRateChange(numValue);
  };

  const handleUniformMarginChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setUniformMargin(numValue);
  };

  const applyUniformMargin = () => {
    const newMargins: Record<string, number> = {};
    washrooms.forEach(washroom => {
      newMargins[washroom.id] = uniformMargin;
    });

    setLocalMargins(newMargins);
    onMarginsChange(newMargins);
  };

  // Helper to get actual margin percentage used in calculations
  const getMarginDisplay = (washroomId: string): string => {
    const marginValue = localMargins[washroomId];
    return marginValue !== undefined ? marginValue.toFixed(2) : '0.00';
  };

  return (
    <div className="space-y-4 border p-4 rounded-md bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-indigo-900">Internal Pricing Calculator</h3>
          <p className="text-sm text-indigo-700">
            Set margins and calculate GST (not visible to clients)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="internal-pricing" 
            checked={internalPricing}
            onCheckedChange={onInternalPricingToggle}
            className="data-[state=checked]:bg-indigo-600"
          />
          <Label htmlFor="internal-pricing" className="font-medium text-indigo-800">
            Enable Internal Pricing
          </Label>
        </div>
      </div>

      {internalPricing && (
        <>
          <Card className="border border-indigo-100 shadow-sm bg-white">
            <CardHeader className="pb-2 bg-indigo-50 rounded-t-lg">
              <CardTitle className="text-md text-indigo-800 flex items-center justify-between">
                <span>Margin Settings</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <Info className="h-4 w-4 text-indigo-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Margins are applied only to execution services, not to brand products or fixtures.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-4 mb-4 pb-3 border-b border-indigo-100">
                  <Label htmlFor="gst-rate" className="min-w-32 font-medium text-indigo-700">GST Rate (%)</Label>
                  <Input 
                    id="gst-rate" 
                    type="number" 
                    min="0" 
                    max="100" 
                    step="0.01"
                    value={gstRate}
                    onChange={(e) => handleGstRateChange(e.target.value)}
                    className="max-w-24 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-400"
                  />
                </div>

                {/* Quick margin setting for all washrooms */}
                <div className="flex items-center space-x-4 mb-4 p-3 bg-indigo-50/50 rounded-md">
                  <Label htmlFor="uniform-margin" className="min-w-32 font-medium text-indigo-800">
                    Set margin for all washrooms
                  </Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="uniform-margin" 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="0.01"
                      value={uniformMargin}
                      onChange={(e) => handleUniformMarginChange(e.target.value)}
                      className="max-w-24 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-400"
                    />
                    <Button 
                      size="sm" 
                      onClick={applyUniformMargin}
                      variant="secondary"
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-indigo-800 mb-2">Individual Washroom Margins</div>
                  {washrooms.map((washroom) => (
                    <div key={washroom.id} className="flex items-center space-x-4 py-2 border-b border-indigo-50">
                      <Label htmlFor={`margin-${washroom.id}`} className="min-w-32 text-gray-700">
                        {washroom.name} Margin (%)
                      </Label>
                      <Input 
                        id={`margin-${washroom.id}`} 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.01"
                        value={localMargins[washroom.id] !== undefined ? localMargins[washroom.id] : 0}
                        onChange={(e) => handleMarginChange(washroom.id, e.target.value)}
                        className="max-w-24 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {internalPricingDetails && (
            <Accordion type="single" collapsible defaultValue="item-1" className="border border-indigo-100 rounded-lg bg-white">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="px-4 py-3 text-indigo-800 hover:bg-indigo-50 hover:no-underline rounded-t-lg">
                  Internal Pricing Details
                </AccordionTrigger>
                <AccordionContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-indigo-800">Washroom Breakdown</h4>
                      <Table>
                        <TableHeader className="bg-indigo-50">
                          <TableRow>
                            <TableHead className="text-indigo-800">Washroom</TableHead>
                            <TableHead className="text-right text-indigo-800">Base Price</TableHead>
                            <TableHead className="text-right text-indigo-800">Margin %</TableHead>
                            <TableHead className="text-right text-indigo-800">With Margin</TableHead>
                            <TableHead className="text-right text-indigo-800">GST</TableHead>
                            <TableHead className="text-right text-indigo-800">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {washrooms.map((washroom) => {
                            const pricing = internalPricingDetails?.washroomPricing?.[washroom.id] || {
                              basePrice: 0,
                              marginPercentage: 0,
                              marginAmount: 0,
                              priceWithMargin: 0,
                              gstAmount: 0,
                              totalPrice: 0
                            };

                            // Display the user-specified margin percentage
                            const userMarginPercentage = getMarginDisplay(washroom.id);

                            return (
                              <TableRow key={washroom.id} className="hover:bg-indigo-50/30">
                                <TableCell className="font-medium text-gray-800">{washroom.name}</TableCell>
                                <TableCell className="text-right text-gray-800">₹{formatAmount(pricing.basePrice)}</TableCell>
                                <TableCell className="text-right text-gray-800">{userMarginPercentage}%</TableCell>
                                <TableCell className="text-right text-gray-800">₹{formatAmount(pricing.priceWithMargin)}</TableCell>
                                <TableCell className="text-right text-gray-800">₹{formatAmount(pricing.gstAmount)}</TableCell>
                                <TableCell className="text-right font-medium text-indigo-700">₹{formatAmount(pricing.totalPrice)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-md shadow-sm border border-indigo-100">
                      <h4 className="font-medium mb-3 text-indigo-800 flex items-center">
                        <span>Project Summary</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full ml-1">
                                <Info className="h-4 w-4 text-indigo-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>Complete Margin is the total margin amount calculated based on the margin percentages for each washroom's execution services.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-gray-800">
                        {internalPricingDetails?.projectSummary ? (
                          <>
                            <div className="text-sm text-gray-700">Execution Services Base Price:</div>
                            <div className="text-right font-medium">₹{formatAmount(internalPricingDetails.projectSummary.executionServicesBasePrice || 0)}</div>

                            <div className="text-sm text-gray-700">Product & Fixtures Price:</div>
                            <div className="text-right font-medium">₹{formatAmount((internalPricingDetails.projectSummary.totalBasePrice || 0) - (internalPricingDetails.projectSummary.executionServicesBasePrice || 0))}</div>

                            <div className="text-sm text-gray-700 border-t border-indigo-100 pt-1">Total Base Price:</div>
                            <div className="text-right font-medium border-t border-indigo-100 pt-1">₹{formatAmount(internalPricingDetails.projectSummary.totalBasePrice)}</div>

                            <div className="text-sm text-gray-700">Complete Margin:</div>
                            <div className="text-right font-medium">₹{formatAmount(internalPricingDetails.projectSummary.marginAmount || 0)}</div>

                            <div className="text-sm text-gray-700">Price with Margin:</div>
                            <div className="text-right font-medium">₹{formatAmount(internalPricingDetails.projectSummary.totalWithMargin)}</div>

                            <div className="text-sm text-gray-700">GST ({gstRate}%):</div>
                            <div className="text-right font-medium">₹{formatAmount(internalPricingDetails.projectSummary.totalGST)}</div>

                            <div className="text-sm border-t pt-1 font-semibold text-indigo-900">Grand Total:</div>
                            <div className="text-right border-t pt-1 font-semibold text-indigo-900">₹{formatAmount(internalPricingDetails.projectSummary.grandTotal)}</div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-700">No pricing details available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </>
      )}
    </div>
  );
};

export default InternalPricingSection;