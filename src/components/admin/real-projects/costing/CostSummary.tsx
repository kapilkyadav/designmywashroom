
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
          <span className="text-gray-800">Base Price:</span>
          <span className="text-gray-800">₹{formatNumber(subtotal)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-800">Complete Margin ({marginPercentage}%):</span>
          <span className="text-gray-800">₹{formatNumber(marginAmount)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-800">Price with Margin:</span>
          <span className="text-gray-800">₹{formatNumber(priceWithMargin)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-800">GST (18%):</span>
          <span className="text-gray-800">₹{formatNumber(gstAmount)}</span>
        </div>
        
        <div className="flex justify-between pt-4 font-bold text-gray-900">
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
        <div className="text-sm text-gray-700">
          <h4 className="font-medium text-foreground">Cost Breakdown</h4>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700">Execution Services:</span>
              <span className="text-gray-700">₹{formatNumber(executionTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Vendor Services:</span>
              <span className="text-gray-700">₹{formatNumber(vendorTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Additional Services:</span>
              <span className="text-gray-700">₹{formatNumber(additionalTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Product Cost:</span>
              <span className="text-gray-700">₹{formatNumber(productCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Logistics Cost:</span>
              <span className="text-gray-700">₹{formatNumber(logisticsCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CostSummary;
