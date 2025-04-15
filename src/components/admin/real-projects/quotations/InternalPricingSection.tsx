
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
    <div className="space-y-4 border p-4 rounded-md bg-amber-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Internal Pricing Calculator</h3>
          <p className="text-sm text-muted-foreground">
            Set margins and calculate GST (not visible to clients)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="internal-pricing" 
            checked={internalPricing}
            onCheckedChange={onInternalPricingToggle}
          />
          <Label htmlFor="internal-pricing">Enable Internal Pricing</Label>
        </div>
      </div>
      
      {internalPricing && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Margin Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-4 mb-4">
                  <Label htmlFor="gst-rate" className="min-w-32">GST Rate (%)</Label>
                  <Input 
                    id="gst-rate" 
                    type="number" 
                    min="0" 
                    max="100" 
                    step="0.01"
                    value={gstRate}
                    onChange={(e) => handleGstRateChange(e.target.value)}
                    className="max-w-24"
                  />
                </div>
                
                {washrooms.map((washroom) => (
                  <div key={washroom.id} className="flex items-center space-x-4">
                    <Label htmlFor={`margin-${washroom.id}`} className="min-w-32">
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
                      className="max-w-24"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {internalPricingDetails && (
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Internal Pricing Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Washroom Breakdown</h4>
                      <Table>
                        <TableHeader>
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
                              <TableRow key={washroom.id}>
                                <TableCell>{washroom.name}</TableCell>
                                <TableCell className="text-right">₹{formatAmount(pricing.basePrice)}</TableCell>
                                <TableCell className="text-right">{pricing.marginPercentage.toFixed(2)}%</TableCell>
                                <TableCell className="text-right">₹{formatAmount(pricing.priceWithMargin)}</TableCell>
                                <TableCell className="text-right">₹{formatAmount(pricing.gstAmount)}</TableCell>
                                <TableCell className="text-right font-medium">₹{formatAmount(pricing.totalPrice)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-md">
                      <h4 className="font-medium mb-3">Project Summary</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-sm">Base Price:</div>
                        <div className="text-right font-medium">₹{formatAmount(internalPricingDetails.projectSummary.totalBasePrice)}</div>
                        
                        <div className="text-sm">Average Margin ({internalPricingDetails.projectSummary.averageMargin.toFixed(2)}%):</div>
                        <div className="text-right font-medium">₹{formatAmount(internalPricingDetails.projectSummary.totalWithMargin - internalPricingDetails.projectSummary.totalBasePrice)}</div>
                        
                        <div className="text-sm">Price with Margin:</div>
                        <div className="text-right font-medium">₹{formatAmount(internalPricingDetails.projectSummary.totalWithMargin)}</div>
                        
                        <div className="text-sm">GST ({gstRate}%):</div>
                        <div className="text-right font-medium">₹{formatAmount(internalPricingDetails.projectSummary.totalGST)}</div>
                        
                        <div className="text-sm border-t pt-1 font-semibold">Grand Total:</div>
                        <div className="text-right border-t pt-1 font-semibold">₹{formatAmount(internalPricingDetails.projectSummary.grandTotal)}</div>
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
