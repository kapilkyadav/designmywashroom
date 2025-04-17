
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
  
  // GST is 18% of execution services only (not on product/logistics)
  const gstAmount = executionServicesTotal * 0.18; // 18% GST
  
  return (
    <>
      <h3 className="text-lg font-medium">Price Summary</h3>
      
      <div className="mt-4 space-y-4">
        <div className="flex justify-between py-2 border-b">
          <span>Execution Services Cost</span>
          <span>₹{formatNumber(executionServicesTotal)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Product Cost</span>
          <span>₹{formatNumber(productCost)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Logistics and Creative Service (7.5%)</span>
          <span>₹{formatNumber(logisticsCost)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Subtotal (before GST)</span>
          <span>₹{formatNumber(subtotal)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>GST (18%)</span>
          <span>₹{formatNumber(gstAmount)}</span>
        </div>
        
        <div className="flex justify-between pt-4 font-bold">
          <span>Total Amount (with GST)</span>
          <span>₹{formatNumber(grandTotal)}</span>
        </div>
        
        {originalEstimate > 0 && (
          <div className="mt-2 pt-2 border-t text-sm text-muted-foreground flex justify-between">
            <span>Original Estimate:</span>
            <span>₹{formatNumber(originalEstimate)}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default CostSummary;
