import React, { useState } from 'react';
import { RealProject } from '@/services/real-projects/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CostItem } from './types';
import { useCostingState } from './useCostingState';
import CostFormCard from './CostFormCard';
import CostSummaryCard from './CostSummaryCard';
import CostTables from './CostTables';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  
  // Use product_cost and logistics_cost directly from the project, with state to edit them
  const [productCost, setProductCost] = useState(project.product_cost || 0);
  const [logisticsCost, setLogisticsCost] = useState(project.logistics_cost || 0);
  
  console.log("Product cost in CostingTab:", productCost);
  console.log("Logistics cost in CostingTab:", logisticsCost);
  
  // Execution services total
  const executionServicesTotal = executionTotal + vendorTotal + additionalTotal;
  
  // Calculate subtotal (execution + product + logistics)
  const subtotal = executionServicesTotal + productCost + logisticsCost;
  
  // Apply a fixed margin percentage (for consistency with CostSummary component)
  const marginPercentage = 1.52; // 1.52%
  const marginAmount = subtotal * (marginPercentage / 100);
  const priceWithMargin = subtotal + marginAmount;
  
  // GST is 18% of execution services only (not on product/logistics)
  const gstAmount = executionServicesTotal * 0.18; // 18% GST
  
  // Final total with GST
  const finalTotal = priceWithMargin + gstAmount;
  
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
  
  const handleProductCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setProductCost(value);
  };
  
  const handleLogisticsCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setLogisticsCost(value);
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

      console.log("Saving with product cost:", productCost);
      console.log("Saving with logistics cost:", logisticsCost);
      console.log("Saving with final total:", finalTotal);
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CostFormCard onAddItem={addNewItem} />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product & Logistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product-cost">Product Cost</Label>
                <Input
                  id="product-cost"
                  type="number"
                  value={productCost}
                  onChange={handleProductCostChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="logistics-cost">Logistics Cost</Label>
                <Input
                  id="logistics-cost"
                  type="number"
                  value={logisticsCost}
                  onChange={handleLogisticsCostChange}
                  className="mt-1"
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                Enter the total cost for products and logistics directly.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
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
