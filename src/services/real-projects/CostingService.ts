
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { BaseService } from './BaseService';
import { Washroom } from './types';
import { VendorRateCardService } from '@/services/VendorRateCardService';

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
      
      // Get rate cards for all selected services in one batch
      const serviceItems = await VendorRateCardService.getItemsByIds(selectedServiceIds);
      const rateCards = await Promise.all(
        selectedServiceIds.map(id => VendorRateCardService.getRateCardByItemId(id))
      );
      
      // Create a map of service ID to rate
      const serviceRates: Record<string, number> = {};
      rateCards.forEach((rateCard, index) => {
        if (rateCard) {
          serviceRates[selectedServiceIds[index]] = rateCard.client_rate;
        }
      });
      
      washrooms.forEach(washroom => {
        const area = washroom.length * washroom.width;
        totalArea += area;
        
        // Calculate tiling cost if tiling service is selected
        if (washroom.services && Object.entries(washroom.services).some(([id, selected]) => 
          selected && id.includes('tiling'))) {
          const washroomTilingCost = area * combinedTilingRate;
          totalTilingCost += washroomTilingCost;
        }
        
        // Calculate cost for other selected services
        if (washroom.services) {
          Object.entries(washroom.services).forEach(([serviceId, isSelected]) => {
            if (isSelected) {
              // Use the rate from our serviceRates map
              const serviceRate = serviceRates[serviceId] || 0;
              // Store in executionCosts if not already there
              if (!executionCosts[serviceId]) {
                executionCosts[serviceId] = serviceRate;
              }
              // Add to total
              executionServicesTotal += serviceRate;
            }
          });
        }
      });
      
      // If executionCosts already contains values, use those for calculating total
      if (Object.keys(executionCosts).length > 0) {
        executionServicesTotal = Object.values(executionCosts).reduce(
          (sum: number, cost: number) => sum + (cost || 0), 
          0
        );
      }
      
      // Calculate final quote amount
      const finalQuotationAmount = executionServicesTotal + totalTilingCost;
      
      return {
        tiling_cost: totalTilingCost,
        execution_services_total: executionServicesTotal,
        total_area: totalArea,
        combined_tiling_rate: combinedTilingRate,
        final_quotation_amount: finalQuotationAmount,
        service_rates: serviceRates
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
