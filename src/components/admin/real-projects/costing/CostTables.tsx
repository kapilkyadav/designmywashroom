
import React from 'react';
import CostTable from './CostTable';
import { CostItem } from './types';

interface CostTablesProps {
  executionCosts: CostItem[];
  vendorRates: CostItem[];
  additionalCosts: CostItem[];
  onRemoveItem: (id: string, category: string) => void;
}

const CostTables: React.FC<CostTablesProps> = ({
  executionCosts,
  vendorRates,
  additionalCosts,
  onRemoveItem
}) => {
  return (
    <div className="space-y-8 mt-8">
      <CostTable 
        items={executionCosts} 
        title="Execution Costs" 
        description="Costs related to project execution and labor" 
        onRemoveItem={(id) => onRemoveItem(id, 'execution')}
      />
      
      <CostTable 
        items={vendorRates} 
        title="Vendor Rates" 
        description="Costs from vendors and material suppliers" 
        onRemoveItem={(id) => onRemoveItem(id, 'vendor')}
      />
      
      <CostTable 
        items={additionalCosts} 
        title="Additional Costs" 
        description="Any extra costs associated with the project" 
        onRemoveItem={(id) => onRemoveItem(id, 'additional')}
      />
    </div>
  );
};

export default CostTables;
