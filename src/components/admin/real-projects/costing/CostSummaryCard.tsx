
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CostSummary from './CostSummary';
import SaveButton from './SaveButton';

interface CostSummaryCardProps {
  executionTotal: number;
  vendorTotal: number;
  additionalTotal: number;
  originalEstimate: number;
  grandTotal: number;
  productCost: number;
  logisticsCost: number;
  isSaving: boolean;
  onSave: () => void;
}

const CostSummaryCard: React.FC<CostSummaryCardProps> = ({
  executionTotal,
  vendorTotal,
  additionalTotal,
  originalEstimate,
  grandTotal,
  productCost,
  logisticsCost,
  isSaving,
  onSave
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <CostSummary 
          executionTotal={executionTotal}
          vendorTotal={vendorTotal}
          additionalTotal={additionalTotal}
          originalEstimate={originalEstimate}
          grandTotal={grandTotal}
          productCost={productCost}
          logisticsCost={logisticsCost}
        />
        
        <div className="mt-6">
          <SaveButton 
            className="w-full" 
            onClick={onSave} 
            isSaving={isSaving} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CostSummaryCard;
