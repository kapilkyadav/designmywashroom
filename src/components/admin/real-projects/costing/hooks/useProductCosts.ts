
import { useState, useEffect } from 'react';
import { ProductService } from '@/services/ProductService';
import { RealProject } from '@/services/real-projects/types';

export const useProductCosts = (project: RealProject) => {
  const [productCost, setProductCost] = useState(0);
  const [logisticsCost, setLogisticsCost] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateProductCosts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get all washrooms from the project
        const washrooms = project.washrooms || [];
        let totalProductCost = 0;
        
        console.log('Calculating product costs for washrooms:', washrooms);
        
        // Process each washroom that has a selected brand
        for (const washroom of washrooms) {
          if (washroom.selected_brand) {
            console.log(`Fetching products for washroom ${washroom.name} with brand ${washroom.selected_brand}`);
            
            // Check if selected_brand is a string (brand name) or an ID
            let brandId = washroom.selected_brand;
            
            // If it's not a UUID format, we might need to fetch the brand ID first
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandId)) {
              // This is a fallback in case selected_brand is a name rather than ID
              console.log(`Treating ${brandId} as a brand name, need to get ID`);
              // Note: You would need to implement this function in ProductService
              // For now we'll skip this washroom if it's not an ID
              continue;
            }
            
            // Fetch products for this brand
            const products = await ProductService.getProductsByBrandId(brandId);
            console.log(`Found ${products.length} products for brand ${brandId}`);
            
            // Sum up quotation_price for this washroom's products
            const washroomProductTotal = products.reduce((sum, product) => {
              const price = product.quotation_price || 0;
              console.log(`Product: ${product.name}, Price: ${price}`);
              return sum + price;
            }, 0);
            
            console.log(`Total product cost for washroom ${washroom.name}: ${washroomProductTotal}`);
            totalProductCost += washroomProductTotal;
          } else {
            console.log(`Washroom ${washroom.name} has no selected brand`);
          }
        }
        
        console.log('Final total product cost:', totalProductCost);
        setProductCost(totalProductCost);
        
        // Calculate logistics cost as 7.5% of product cost
        const logistics = totalProductCost * 0.075;
        console.log('Logistics cost (7.5% of product cost):', logistics);
        setLogisticsCost(logistics);
      } catch (error) {
        console.error('Error calculating product costs:', error);
        setError('Failed to calculate product costs');
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
    isLoading,
    error
  };
};
