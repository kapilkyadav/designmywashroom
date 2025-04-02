
import { useState, useMemo } from 'react';
import { RealProject } from '@/services/RealProjectService';
import { CostItem } from './types';

export const useCostingState = (project: RealProject) => {
  // Parse existing costs from project
  const initialExecutionCosts = Object.entries(project.execution_costs || {}).map(([id, item]: [string, any]) => ({
    id,
    ...item,
    category: 'execution' as const
  }));
  
  const initialVendorRates = Object.entries(project.vendor_rates || {}).map(([id, item]: [string, any]) => ({
    id,
    ...item,
    category: 'vendor' as const
  }));
  
  const initialAdditionalCosts = Object.entries(project.additional_costs || {}).map(([id, item]: [string, any]) => ({
    id,
    ...item,
    category: 'additional' as const
  }));
  
  const [executionCosts, setExecutionCosts] = useState<CostItem[]>(initialExecutionCosts);
  const [vendorRates, setVendorRates] = useState<CostItem[]>(initialVendorRates);
  const [additionalCosts, setAdditionalCosts] = useState<CostItem[]>(initialAdditionalCosts);

  // Calculate totals
  const executionTotal = useMemo(() => executionCosts.reduce((sum, item) => sum + item.amount, 0), [executionCosts]);
  const vendorTotal = useMemo(() => vendorRates.reduce((sum, item) => sum + item.amount, 0), [vendorRates]);
  const additionalTotal = useMemo(() => additionalCosts.reduce((sum, item) => sum + item.amount, 0), [additionalCosts]);
  
  // Grand total calculation
  const grandTotal = useMemo(() => 
    executionTotal + vendorTotal + additionalTotal + (project.original_estimate || 0), 
    [executionTotal, vendorTotal, additionalTotal, project.original_estimate]
  );

  return {
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
  };
};
