
import React from 'react';

interface CostSummaryProps {
  executionTotal: number;
  vendorTotal: number;
  additionalTotal: number;
  originalEstimate: number;
  grandTotal: number;
}

const CostSummary: React.FC<CostSummaryProps> = ({
  executionTotal,
  vendorTotal,
  additionalTotal,
  originalEstimate,
  grandTotal
}) => {
  return (
    <>
      <h3 className="text-lg font-medium">Summary</h3>
      
      <div className="mt-4 space-y-4">
        <div className="flex justify-between py-2 border-b">
          <span>Original Estimate</span>
          <span>₹{originalEstimate.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Execution Costs</span>
          <span>₹{executionTotal.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Vendor Rates</span>
          <span>₹{vendorTotal.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span>Additional Costs</span>
          <span>₹{additionalTotal.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="flex justify-between pt-4 font-bold">
          <span>Final Quotation Amount</span>
          <span>₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </>
  );
};

export default CostSummary;
