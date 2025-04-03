
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { EstimateResult } from '@/services/CalculatorService';

interface CostBreakdownProps {
  estimate: EstimateResult;
  brandName: string;
}

const CostBreakdown: React.FC<CostBreakdownProps> = ({ estimate, brandName }) => {
  // Function to format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Fixture Cost</span>
        <span className="font-medium">{formatCurrency(estimate.fixtureCost)}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Plumbing Work</span>
        <span className="font-medium">{formatCurrency(estimate.plumbingCost)}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Tiling Work</span>
        <span className="font-medium">{formatCurrency(estimate.tilingCost.total)}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">{brandName || 'Brand'} Products</span>
        <span className="font-medium">{formatCurrency(estimate.productCost)}</span>
      </div>
      
      <Separator className="my-2" />
      
      <div className="flex justify-between items-center text-lg font-semibold">
        <span>Total Estimate</span>
        <span>{formatCurrency(estimate.total)}</span>
      </div>
    </div>
  );
};

export default CostBreakdown;
