
import React from 'react';

interface CostSummaryProps {
  executionTotal: number;
  vendorTotal: number;
  additionalTotal: number;
  originalEstimate: number;
  grandTotal: number;
  productCost: number;
  logisticsCost: number;
}

const CostSummary: React.FC<CostSummaryProps> = ({
  executionTotal,
  vendorTotal,
  additionalTotal,
  originalEstimate,
  grandTotal,
  productCost,
  logisticsCost
}) => {
  // Safe formatting function
  const formatNumber = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '0';
    return amount.toLocaleString('en-IN');
  };
  
  // Total of all execution services costs (this represents the base cost without margin)
  const executionServicesTotal = executionTotal + vendorTotal + additionalTotal;
  
  // Calculate subtotal (execution services + product + logistics)
  const subtotal = executionServicesTotal + productCost + logisticsCost;
  
  // For demo purposes, applying a fixed margin percentage (can be made dynamic later)
  const marginPercentage = 1.52; // 1.52%
  const marginAmount = subtotal * (marginPercentage / 100);
  const priceWithMargin = subtotal + marginAmount;
  
  // GST is 18% of execution services only (not on product/logistics)
  const gstAmount = executionServicesTotal * 0.18; // 18% GST
  
  return (
    <>
      <h3 className="text-lg font-medium">Project Summary</h3>
      
      <div className="mt-4 space-y-4">
        <div className="flex justify-between py-2 border-b">
          <span>Base Price:</span>
          <span>₹{formatNumber(subtotal)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Average Margin ({marginPercentage}%):</span>
          <span>₹{formatNumber(marginAmount)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Price with Margin:</span>
          <span>₹{formatNumber(priceWithMargin)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>GST (18%):</span>
          <span>₹{formatNumber(gstAmount)}</span>
        </div>
        
        <div className="flex justify-between pt-4 font-bold">
          <span>Grand Total:</span>
          <span>₹{formatNumber(priceWithMargin + gstAmount)}</span>
        </div>
        
        {originalEstimate > 0 && (
          <div className="mt-2 pt-2 border-t text-sm text-muted-foreground flex justify-between">
            <span>Original Estimate:</span>
            <span>₹{formatNumber(originalEstimate)}</span>
          </div>
        )}
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="text-sm text-muted-foreground">
          <h4 className="font-medium text-foreground">Cost Breakdown</h4>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Execution Services:</span>
              <span>₹{formatNumber(executionTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Vendor Services:</span>
              <span>₹{formatNumber(vendorTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Additional Services:</span>
              <span>₹{formatNumber(additionalTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Product Cost:</span>
              <span>₹{formatNumber(productCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Logistics Cost:</span>
              <span>₹{formatNumber(logisticsCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CostSummary;
