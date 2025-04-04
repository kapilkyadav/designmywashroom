
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { BaseService } from './BaseService';
import { Washroom } from './types';
import { VendorRateCardService } from '@/services/VendorRateCardService';
import { ProductService } from '@/services/ProductService';

export class CostingService extends BaseService {
  /**
   * Get vendor items for projects scope of work
   */
  static async getExecutionServices(): Promise<any[]> {
    try {
      // Now fetching from vendor items instead of execution_services
      return VendorRateCardService.getItems();
    } catch (error: any) {
      return this.handleError(error, 'Failed to fetch services');
    }
  }
  
  /**
   * Get tiling rates
   */
  static async getTilingRates(): Promise<{ per_tile_cost: number, tile_laying_cost: number } | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (error) throw error;
      
      return {
        per_tile_cost: data.tile_cost_per_unit || 0,
        tile_laying_cost: data.tiling_labor_per_sqft || 0
      };
    } catch (error: any) {
      console.error('Error fetching tiling rates:', error);
      return null;
    }
  }
  
  /**
   * Get rate for a vendor item from rate card
   */
  static async getVendorItemRate(itemId: string): Promise<number> {
    try {
      const rateCard = await VendorRateCardService.getRateCardByItemId(itemId);
      return rateCard?.client_rate || 0;
    } catch (error) {
      console.error('Error fetching vendor item rate:', error);
      return 0;
    }
  }
  
  /**
   * Get product costs for a brand
   */
  static async getProductCostsByBrand(brandName: string): Promise<number> {
    try {
      // First get the brand ID
      const { data: brandData } = await supabase
        .from('brands')
        .select('id')
        .eq('name', brandName)
        .single();
      
      if (!brandData) return 0;
      
      // Then get all products for this brand
      const products = await ProductService.getProductsByBrandId(brandData.id);
      
      // Calculate total product cost (using quotation_price)
      return products.reduce((sum, product) => sum + (product.quotation_price || 0), 0);
    } catch (error) {
      console.error('Error fetching product costs by brand:', error);
      return 0;
    }
  }
  
  /**
   * Calculate project costs
   */
  static async calculateProjectCosts(
    projectId: string, 
    washrooms: Washroom[], 
    executionCosts: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      // Get tiling rates
      const tilingRates = await this.getTilingRates();
      if (!tilingRates) throw new Error("Unable to fetch tiling rates");
      
      const combinedTilingRate = tilingRates.per_tile_cost + tilingRates.tile_laying_cost;
      
      // Calculate costs for each washroom
      let totalTilingCost = 0;
      let totalArea = 0;
      let executionServicesTotal = 0;
      let productCostsTotal = 0;
      const washroomCosts: Record<string, { executionServices: number, productCosts: number, totalCost: number }> = {};
      
      // Extract all service IDs that are selected across washrooms
      const selectedServiceIds: string[] = [];
      washrooms.forEach(washroom => {
        if (washroom.services) {
          Object.entries(washroom.services).forEach(([id, selected]) => {
            if (selected && !selectedServiceIds.includes(id)) {
              selectedServiceIds.push(id);
            }
          });
        }
      });
      
      // Get all vendor items for proper display and categorization
      const serviceItems = await VendorRateCardService.getItemsByIds(selectedServiceIds);
      
      // Get rate cards for all selected services in one batch
      const rateCards = await Promise.all(
        selectedServiceIds.map(id => VendorRateCardService.getRateCardByItemId(id))
      );
      
      // Create a map of service ID to rate and measurement unit
      const serviceRates: Record<string, number> = {};
      const serviceMeasurements: Record<string, string> = {};
      
      rateCards.forEach((rateCard, index) => {
        if (rateCard) {
          serviceRates[selectedServiceIds[index]] = rateCard.client_rate;
          
          // Find the corresponding service item to get the measuring unit
          const serviceItem = serviceItems.find(item => item.id === selectedServiceIds[index]);
          if (serviceItem) {
            serviceMeasurements[selectedServiceIds[index]] = serviceItem.measuring_unit;
          }
        }
      });
      
      // Process each washroom
      for (let i = 0; i < washrooms.length; i++) {
        const washroom = washrooms[i];
        const area = washroom.length * washroom.width;
        totalArea += area;
        
        let washroomExecutionCost = 0;
        let washroomProductCost = 0;
        
        // Calculate tiling cost if tiling service is selected
        if (washroom.services && Object.entries(washroom.services).some(([id, selected]) => 
          selected && serviceMeasurements[id]?.toLowerCase().includes('tile'))) {
          const washroomTilingCost = area * combinedTilingRate;
          totalTilingCost += washroomTilingCost;
          washroomExecutionCost += washroomTilingCost;
        }
        
        // Calculate cost for other selected services based on measurement unit
        if (washroom.services) {
          Object.entries(washroom.services).forEach(([serviceId, isSelected]) => {
            if (isSelected) {
              // Use the rate from our serviceRates map
              const serviceRate = serviceRates[serviceId] || 0;
              const measurementUnit = serviceMeasurements[serviceId]?.toLowerCase() || '';
              
              let serviceCost = serviceRate;
              
              // Adjust cost based on measurement unit
              if (measurementUnit.includes('sqft') || measurementUnit.includes('sft') || 
                  measurementUnit.includes('sq ft') || measurementUnit.includes('square')) {
                // Per square foot pricing
                serviceCost = serviceRate * area;
              }
              // For "bathroom" or "nos" (number), use the flat rate
              
              // Store in executionCosts if not already there
              if (!executionCosts[serviceId]) {
                executionCosts[serviceId] = serviceRate;
              }
              
              // Add to washroom execution cost
              washroomExecutionCost += serviceCost;
            }
          });
        }
        
        // Get product costs for this washroom's brand
        if (washroom.selected_brand) {
          washroomProductCost = await this.getProductCostsByBrand(washroom.selected_brand);
          productCostsTotal += washroomProductCost;
        }
        
        // Store washroom costs
        washroomCosts[washroom.id] = {
          executionServices: washroomExecutionCost,
          productCosts: washroomProductCost,
          totalCost: washroomExecutionCost + washroomProductCost
        };
        
        // Add to total execution services cost
        executionServicesTotal += washroomExecutionCost;
      }
      
      // Calculate final quote amount
      const finalQuotationAmount = executionServicesTotal + productCostsTotal;
      
      return {
        tiling_cost: totalTilingCost,
        execution_services_total: executionServicesTotal,
        product_costs_total: productCostsTotal,
        total_area: totalArea,
        combined_tiling_rate: combinedTilingRate,
        final_quotation_amount: finalQuotationAmount,
        service_rates: serviceRates,
        service_measurements: serviceMeasurements,
        washroom_costs: washroomCosts
      };
    } catch (error: any) {
      console.error('Error calculating project costs:', error);
      toast({
        title: "Cost calculation failed",
        description: error.message,
        variant: "destructive",
      });
      return {};
    }
  }
}
