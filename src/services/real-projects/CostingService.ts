
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { BaseService } from './BaseService';
import { Washroom } from './types';

export class CostingService extends BaseService {
  /**
   * Get execution services for projects
   */
  static async getExecutionServices(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('execution_services')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
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
      
      washrooms.forEach(washroom => {
        const area = washroom.length * washroom.width;
        totalArea += area;
        
        // Calculate tiling cost if tiling service is selected
        if (washroom.services && washroom.services['tiling']) {
          const washroomTilingCost = area * combinedTilingRate;
          totalTilingCost += washroomTilingCost;
        }
      });
      
      // Sum up execution costs
      const executionServicesTotal = Object.values(executionCosts).reduce(
        (sum: number, cost: number) => sum + (cost || 0), 
        0
      );
      
      // Calculate final quote amount
      const finalQuotationAmount = executionServicesTotal + totalTilingCost;
      
      return {
        tiling_cost: totalTilingCost,
        execution_services_total: executionServicesTotal,
        total_area: totalArea,
        combined_tiling_rate: combinedTilingRate,
        final_quotation_amount: finalQuotationAmount
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
