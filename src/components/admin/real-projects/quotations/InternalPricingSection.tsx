
import React, { useState } from 'react';
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
              <CardTitle className="text-md text-indigo-800">Margin Settings</CardTitle>
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
                
                {washrooms.map((washroom) => (
                  <div key={washroom.id} className="flex items-center space-x-4">
                    <Label htmlFor={`margin-${washroom.id}`} className="min-w-32 text-gray-700">
                      {washroom.name} Margin (%)
                    </Label>
                    <Input 
                      id={`margin-${washroom.id}`} 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="0.01"
                      value={localMargins[washroom.id] || 0}
                      onChange={(e) => handleMarginChange(washroom.id, e.target.value)}
                      className="max-w-24 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-400"
                    />
                  </div>
                ))}
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
                            <TableHead>Washroom</TableHead>
                            <TableHead className="text-right">Base Price</TableHead>
                            <TableHead className="text-right">Margin %</TableHead>
                            <TableHead className="text-right">With Margin</TableHead>
                            <TableHead className="text-right">GST</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {washrooms.map((washroom) => {
                            const pricing = internalPricingDetails.washroomPricing[washroom.id] || {
                              basePrice: 0,
                              marginPercentage: 0,
                              priceWithMargin: 0,
                              gstAmount: 0,
                              totalPrice: 0
                            };
                            
                            return (
                              <TableRow key={washroom.id} className="hover:bg-indigo-50/30">
                                <TableCell className="font-medium">{washroom.name}</TableCell>
                                <TableCell className="text-right">₹{formatAmount(pricing.basePrice)}</TableCell>
                                <TableCell className="text-right">{pricing.marginPercentage.toFixed(2)}%</TableCell>
                                <TableCell className="text-right">₹{formatAmount(pricing.priceWithMargin)}</TableCell>
                                <TableCell className="text-right">₹{formatAmount(pricing.gstAmount)}</TableCell>
                                <TableCell className="text-right font-medium text-indigo-700">₹{formatAmount(pricing.totalPrice)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-md shadow-sm border border-indigo-100">
                      <h4 className="font-medium mb-3 text-indigo-800">Project Summary</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm text-gray-700">Base Price:</div>
                        <div className="text-right font-medium text-gray-800">₹{formatAmount(internalPricingDetails.projectSummary.totalBasePrice)}</div>
                        
                        <div className="text-sm text-gray-700">Average Margin ({internalPricingDetails.projectSummary.averageMargin.toFixed(2)}%):</div>
                        <div className="text-right font-medium text-gray-800">₹{formatAmount(internalPricingDetails.projectSummary.totalWithMargin - internalPricingDetails.projectSummary.totalBasePrice)}</div>
                        
                        <div className="text-sm text-gray-700">Price with Margin:</div>
                        <div className="text-right font-medium text-gray-800">₹{formatAmount(internalPricingDetails.projectSummary.totalWithMargin)}</div>
                        
                        <div className="text-sm text-gray-700">GST ({gstRate}%):</div>
                        <div className="text-right font-medium text-gray-800">₹{formatAmount(internalPricingDetails.projectSummary.totalGST)}</div>
                        
                        <div className="text-sm border-t pt-1 font-semibold text-indigo-900">Grand Total:</div>
                        <div className="text-right border-t pt-1 font-semibold text-indigo-900">₹{formatAmount(internalPricingDetails.projectSummary.grandTotal)}</div>
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
