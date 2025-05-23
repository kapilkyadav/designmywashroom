
import { FixtureService } from '@/services/FixtureService';
import { ProductService } from '@/services/ProductService';
import { SettingsService } from '@/services/SettingsService';
import { CalculatorState, EstimateResult } from './types';

export class EstimationService {
  /**
   * Calculate the cost estimate based on the calculator state
   */
  async calculateEstimate(calculatorState: CalculatorState): Promise<EstimateResult> {
    try {
      // Fetch app settings for calculation constants
      const settings = await SettingsService.getSettings();
      
      // Calculate fixture costs
      const fixtureCost = await this.calculateFixtureCost(calculatorState);
      
      // Calculate product cost from selected brand - ensure this is properly calculated
      const productCost = await this.calculateProductCost(calculatorState.selectedBrand);
      console.log('Product cost calculated:', productCost);
      
      // Calculate plumbing cost using settings from database
      const floorArea = calculatorState.dimensions.length * calculatorState.dimensions.width;
      const plumbingCost = floorArea * settings.plumbing_rate_per_sqft;
      
      // Calculate tiling cost
      const tilingCost = this.calculateTilingCost(
        calculatorState.dimensions.length,
        calculatorState.dimensions.width,
        settings
      );
      
      // Calculate total estimate including product cost
      const totalEstimate = fixtureCost + plumbingCost + tilingCost.total + productCost;
      
      // Log all costs for debugging
      console.log('Cost breakdown:', {
        fixtureCost,
        plumbingCost,
        tilingCost: tilingCost.total,
        productCost,
        total: totalEstimate
      });
      
      return {
        fixtureCost,
        plumbingCost,
        tilingCost,
        productCost,
        total: totalEstimate
      };
    } catch (error) {
      console.error('Error calculating estimate:', error);
      throw error;
    }
  }
  
  /**
   * Calculate the cost of fixtures based on selected options
   */
  private async calculateFixtureCost(calculatorState: CalculatorState): Promise<number> {
    let fixtureCost = 0;
    
    // Get all fixtures from the database based on selection
    const electricalFixtures = await FixtureService.getFixturesByCategory('electrical');
    const plumbingFixtures = await FixtureService.getFixturesByCategory('plumbing');
    const additionalFixtures = await FixtureService.getFixturesByCategory('additional');
    
    // Process electrical fixtures
    for (const fixture of electricalFixtures) {
      if (calculatorState.fixtures.electrical.ledMirror && 
          fixture.name.toLowerCase().includes('led mirror')) {
        fixtureCost += fixture.client_price;
      }
      if (calculatorState.fixtures.electrical.exhaustFan && 
          fixture.name.toLowerCase().includes('exhaust fan')) {
        fixtureCost += fixture.client_price;
      }
      if (calculatorState.fixtures.electrical.waterHeater && 
          fixture.name.toLowerCase().includes('water heater')) {
        fixtureCost += fixture.client_price;
      }
    }
    
    // Process plumbing fixtures
    for (const fixture of plumbingFixtures) {
      if (calculatorState.fixtures.plumbing.completePlumbing && 
          fixture.name.toLowerCase().includes('complete plumbing')) {
        fixtureCost += fixture.client_price;
      }
      if (calculatorState.fixtures.plumbing.fixtureInstallationOnly && 
          fixture.name.toLowerCase().includes('fixture installation')) {
        fixtureCost += fixture.client_price;
      }
    }
    
    // Process additional fixtures
    for (const fixture of additionalFixtures) {
      if (calculatorState.fixtures.additional.showerPartition && 
          fixture.name.toLowerCase().includes('shower partition')) {
        fixtureCost += fixture.client_price;
      }
      if (calculatorState.fixtures.additional.vanity && 
          fixture.name.toLowerCase().includes('vanity')) {
        fixtureCost += fixture.client_price;
      }
      if (calculatorState.fixtures.additional.bathtub && 
          fixture.name.toLowerCase().includes('bathtub')) {
        fixtureCost += fixture.client_price;
      }
      if (calculatorState.fixtures.additional.jacuzzi && 
          fixture.name.toLowerCase().includes('jacuzzi')) {
        fixtureCost += fixture.client_price;
      }
    }
    
    // Always add "other execution charges" fixture to every estimate
    try {
      const otherExecutionCharges = additionalFixtures.find(
        fixture => fixture.name.toLowerCase().includes('other execution charges')
      );
      
      if (otherExecutionCharges) {
        console.log('Adding mandatory other execution charges:', otherExecutionCharges.client_price);
        fixtureCost += otherExecutionCharges.client_price;
      } else {
        console.warn('Other execution charges fixture not found in the database');
      }
    } catch (error) {
      console.error('Error adding other execution charges:', error);
    }
    
    return fixtureCost;
  }
  
  /**
   * Calculate the cost of products from the selected brand
   */
  private async calculateProductCost(brandId: string): Promise<number> {
    let productCost = 0;
    if (brandId) {
      try {
        console.log('Fetching products for brand ID:', brandId);
        const products = await ProductService.getProductsByBrandId(brandId);
        console.log(`Found ${products.length} products for brand ${brandId}`);
        
        // Sum up client_price of all products from the selected brand
        if (products && products.length > 0) {
          // Use the sum of client_price for the calculation
          productCost = products.reduce((sum, product) => {
            const price = product.client_price || 0;
            console.log(`Adding product ${product.name}: ${price}`);
            return sum + price;
          }, 0);
        } else {
          console.log('No products found for the selected brand');
        }
        
        console.log(`Selected brand products total cost: ${productCost}`);
      } catch (error) {
        console.error('Error fetching brand products:', error);
        // Continue with calculation even if product fetch fails
      }
    } else {
      console.log('No brand selected, product cost will be 0');
    }
    return productCost;
  }
  
  /**
   * Calculate the cost of tiling based on dimensions and settings
   */
  private calculateTilingCost(
    length: number,
    width: number,
    settings: any
  ): { materialCost: number; laborCost: number; total: number } {
    const wallHeight = 8; // Changed from 9 to 8 feet
    const floorArea = length * width;
    const wallArea = 2 * (length + width) * wallHeight;
    const totalTilingArea = floorArea + wallArea;
    
    // Each 2x2 tile covers 4 sq. ft.
    const tileCoverage = 4;
    const initialTileCount = Math.ceil(totalTilingArea / tileCoverage);
    
    // Add percentage for breakage from settings
    const breakageMultiplier = 1 + (settings.breakage_percentage / 100);
    const totalTileCount = Math.ceil(initialTileCount * breakageMultiplier);
    
    // Calculate material and labor costs using settings from database
    const materialCost = totalTileCount * settings.tile_cost_per_unit;
    const laborCost = totalTilingArea * settings.tiling_labor_per_sqft;
    
    return {
      materialCost,
      laborCost,
      total: materialCost + laborCost
    };
  }
}

// Create a singleton instance
export const estimationService = new EstimationService();
