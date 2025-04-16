
import { useState, useEffect } from 'react';
import { ProductService } from '@/services/ProductService';

export const useProductCosts = (selectedBrandId: string | undefined) => {
  const [productCost, setProductCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const calculateProductCosts = async () => {
      setIsLoading(true);
      try {
        if (selectedBrandId) {
          const products = await ProductService.getProductsByBrandId(selectedBrandId);
          const brandProductTotal = products.reduce((sum, product) => {
            return sum + (product.quotation_price || 0);
          }, 0);
          setProductCost(brandProductTotal);
          
          // Calculate logistics cost as 7.5% of product cost
          const logistics = brandProductTotal * 0.075;
          setLogisticsCost(logistics);
        } else {
          setProductCost(0);
          setLogisticsCost(0);
        }
      } catch (error) {
        console.error('Error calculating product costs:', error);
        setProductCost(0);
        setLogisticsCost(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    calculateProductCosts();
  }, [selectedBrandId]);

  return {
    productCost,
    logisticsCost,
    isLoading
  };
};
