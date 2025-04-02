
import React, { useState } from 'react';
import { RealProject } from '@/services/RealProjectService';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import AddCostItemForm from './AddCostItemForm';
import CostSummary from './CostSummary';
import CostTable from './CostTable';
import { useCostingState } from './useCostingState';
import { CostItem } from './types';

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
    additionalTotal,
    grandTotal
  } = useCostingState(project);
  
  const [isSaving, setIsSaving] = useState(false);
  
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
      // Convert arrays to objects for storage
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
        washrooms: project.washrooms || [], // Include the washrooms property
        final_quotation_amount: grandTotal
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
        <Card>
          <CardContent className="pt-6">
            <AddCostItemForm onAddItem={addNewItem} />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <CostSummary 
              executionTotal={executionTotal}
              vendorTotal={vendorTotal}
              additionalTotal={additionalTotal}
              originalEstimate={project.original_estimate || 0}
              grandTotal={grandTotal}
            />
            
            <div className="mt-6">
              <Button className="w-full" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save All Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-8 mt-8">
        <CostTable 
          items={executionCosts} 
          title="Execution Costs" 
          description="Costs related to project execution and labor" 
          onRemoveItem={(id) => removeItem(id, 'execution')}
        />
        
        <CostTable 
          items={vendorRates} 
          title="Vendor Rates" 
          description="Costs from vendors and material suppliers" 
          onRemoveItem={(id) => removeItem(id, 'vendor')}
        />
        
        <CostTable 
          items={additionalCosts} 
          title="Additional Costs" 
          description="Any extra costs associated with the project" 
          onRemoveItem={(id) => removeItem(id, 'additional')}
        />
      </div>
    </div>
  );
};

export default CostingTab;
