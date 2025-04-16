import { useState } from 'react';
import { RealProject } from '@/services/real-projects/types';

export const useProductCosts = (project: RealProject) => {
  const [productCost, setProductCost] = useState(project.product_cost || 0);
  const [logisticsCost, setLogisticsCost] = useState(project.logistics_cost || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    productCost,
    logisticsCost,
    isLoading,
    error
  };
};
