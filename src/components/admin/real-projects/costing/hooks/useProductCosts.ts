
import { useState, useEffect } from 'react';
import { ProductService } from '@/services/ProductService';
import { RealProject } from '@/services/real-projects/types';

export const useProductCosts = (project: RealProject) => {
  const [productCost, setProductCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const calculateProductCosts = async () => {
      setIsLoading(true);
      try {
        // Get all washrooms from the project
        const washrooms = project.washrooms || [];
        let totalProductCost = 0;
        
        // Process each washroom that has a selected brand
        for (const washroom of washrooms) {
          if (washroom.selected_brand) {
            const products = await ProductService.getProductsByBrandId(washroom.selected_brand);
            // Sum up quotation_price for this washroom's products
            const washroomProductTotal = products.reduce((sum, product) => {
              return sum + (product.quotation_price || 0);
            }, 0);
            
            totalProductCost += washroomProductTotal;
          }
        }
        
        setProductCost(totalProductCost);
        
        // Calculate logistics cost as 7.5% of product cost
        const logistics = totalProductCost * 0.075;
        setLogisticsCost(logistics);
      } catch (error) {
        console.error('Error calculating product costs:', error);
        setProductCost(0);
        setLogisticsCost(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    calculateProductCosts();
  }, [project]);

  return {
    productCost,
    logisticsCost,
    isLoading
  };
};
