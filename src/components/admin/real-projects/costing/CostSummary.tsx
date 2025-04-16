
import React from 'react';

interface CostSummaryProps {
  executionTotal: number;
  vendorTotal: number;
  additionalTotal: number;
  originalEstimate: number;
  grandTotal: number;
  productCost?: number;
  logisticsCost?: number;
}

const CostSummary: React.FC<CostSummaryProps> = ({
  executionTotal,
  vendorTotal,
  additionalTotal,
  originalEstimate,
  grandTotal,
  productCost = 0,
  logisticsCost = 0
}) => {
  // Safe formatting function
  const formatNumber = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '0';
    return amount.toLocaleString('en-IN');
  };
  
  // Calculate subtotal (all costs before GST)
  const subtotal = executionTotal + vendorTotal + additionalTotal + productCost + logisticsCost;
  
  // Assume GST is 18% of execution, vendor, and additional costs (not on product/logistics)
  const gstableAmount = executionTotal + vendorTotal + additionalTotal;
  const gstAmount = gstableAmount * 0.18; // 18% GST
  
  return (
    <>
      <h3 className="text-lg font-medium">Summary</h3>
      
      <div className="mt-4 space-y-4">
        <div className="flex justify-between py-2 border-b">
          <span>Original Estimate</span>
          <span>₹{formatNumber(originalEstimate)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Execution Costs</span>
          <span>₹{formatNumber(executionTotal)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Vendor Rates</span>
          <span>₹{formatNumber(vendorTotal)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Additional Costs</span>
          <span>₹{formatNumber(additionalTotal)}</span>
        </div>

        <div className="flex justify-between py-2 border-b">
          <span>Product Cost</span>
          <span>₹{formatNumber(productCost)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Logistics & Creative Services (7.5%)</span>
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
      </div>
    </>
  );
};

export default CostSummary;
