
import React, { useState } from 'react';
import { RealProject } from '@/services/real-projects/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CostItem } from './types';
import { useCostingState } from './useCostingState';
import { useProductCosts } from './hooks/useProductCosts';
import CostFormCard from './CostFormCard';
import CostSummaryCard from './CostSummaryCard';
import CostTables from './CostTables';

interface CostingTabProps {
  project: RealProject;
  onUpdate: () => void;
}

const CostingTab: React.FC<CostingTabProps> = ({ project, onUpdate }) => {
  const {
    executionCosts,
    vendorRates,
    additionalCosts,
    setExecutionCosts,
    setVendorRates,
    setAdditionalCosts,
    executionTotal,
    vendorTotal,
    additionalTotal
  } = useCostingState(project);
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Use our product costs hook with the whole project to calculate across all washrooms
  const { productCost, logisticsCost } = useProductCosts(project);
  
  // Execution services total
  const executionServicesTotal = executionTotal + vendorTotal + additionalTotal;
  
  // Calculate subtotal (execution + product + logistics)
  const subtotal = executionServicesTotal + productCost + logisticsCost;
  
  // GST is 18% of execution services only (not on product/logistics)
  const gstAmount = executionServicesTotal * 0.18; // 18% GST
  
  // Final total with GST
  const finalTotal = subtotal + gstAmount;
  
  const removeItem = (id: string, category: string) => {
    if (category === 'execution') {
      setExecutionCosts(executionCosts.filter(item => item.id !== id));
    } else if (category === 'vendor') {
      setVendorRates(vendorRates.filter(item => item.id !== id));
    } else {
      setAdditionalCosts(additionalCosts.filter(item => item.id !== id));
    }
  };
  
  const addNewItem = (newItem: CostItem) => {
    if (newItem.category === 'execution') {
      setExecutionCosts([...executionCosts, newItem]);
    } else if (newItem.category === 'vendor') {
      setVendorRates([...vendorRates, newItem]);
    } else {
      setAdditionalCosts([...additionalCosts, newItem]);
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const executionCostsObj = executionCosts.reduce((acc, item) => {
        const { category, ...rest } = item;
        acc[item.id] = rest;
        return acc;
      }, {} as Record<string, any>);
      
      const vendorRatesObj = vendorRates.reduce((acc, item) => {
        const { category, ...rest } = item;
        acc[item.id] = rest;
        return acc;
      }, {} as Record<string, any>);
      
      const additionalCostsObj = additionalCosts.reduce((acc, item) => {
        const { category, ...rest } = item;
        acc[item.id] = rest;
        return acc;
      }, {} as Record<string, any>);
      
      await project.updateCosts({
        execution_costs: executionCostsObj,
        vendor_rates: vendorRatesObj,
        additional_costs: additionalCostsObj,
        washrooms: project.washrooms || [],
        final_quotation_amount: finalTotal,
        product_cost: productCost,
        logistics_cost: logisticsCost
      });
      
      onUpdate();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {project.original_estimate ? (
        <Alert>
          <AlertDescription className="flex justify-between items-center">
            <span>Original Estimate:</span>
            <span className="font-medium">₹{project.original_estimate.toLocaleString('en-IN')}</span>
          </AlertDescription>
        </Alert>
      ) : null}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CostFormCard onAddItem={addNewItem} />
        
        <CostSummaryCard 
          executionTotal={executionTotal}
          vendorTotal={vendorTotal}
          additionalTotal={additionalTotal}
          originalEstimate={project.original_estimate || 0}
          grandTotal={finalTotal}
          productCost={productCost}
          logisticsCost={logisticsCost}
          isSaving={isSaving}
          onSave={handleSave}
        />
      </div>
      
      <CostTables 
        executionCosts={executionCosts}
        vendorRates={vendorRates}
        additionalCosts={additionalCosts}
        onRemoveItem={removeItem}
      />
    </div>
  );
};

export default CostingTab;
