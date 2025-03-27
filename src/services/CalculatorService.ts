
import { supabase, Project, Settings } from '@/lib/supabase';
import { FixtureService } from './FixtureService';
import { BrandService } from './BrandService';
import { SettingsService } from './SettingsService';
import { ProjectService } from './ProjectService';

export interface CalculatorState {
  projectType: 'new-construction' | 'renovation';
  dimensions: {
    length: number;
    width: number;
  };
  fixtures: {
    electrical: {
      ledMirror: boolean;
      exhaustFan: boolean;
      waterHeater: boolean;
    };
    plumbing: {
      completePlumbing: boolean;
      fixtureInstallationOnly: boolean;
    };
    additional: {
      showerPartition: boolean;
      vanity: boolean;
      bathtub: boolean;
      jacuzzi: boolean;
    };
  };
  timeline: 'standard' | 'flexible';
  selectedBrand: string;
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
    location: string;
  };
}

export interface EstimateResult {
  fixtureCost: number;
  plumbingCost: number;
  tilingCost: {
    materialCost: number;
    laborCost: number;
    total: number;
  };
  total: number;
}

export const CalculatorService = {
  async calculateEstimate(calculatorState: CalculatorState): Promise<EstimateResult> {
    try {
      // Fetch app settings for calculation constants
      const settings = await SettingsService.getSettings();
      
      // Calculate fixture costs
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
      
      // Calculate plumbing cost using settings from database
      const floorArea = calculatorState.dimensions.length * calculatorState.dimensions.width;
      const plumbingCost = floorArea * settings.plumbing_rate_per_sqft;
      
      // Calculate tiling cost
      const wallHeight = 9; // Fixed height in feet
      const wallArea = 2 * (calculatorState.dimensions.length + calculatorState.dimensions.width) * wallHeight;
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
      
      // Calculate total tiling cost
      const tilingCost = {
        materialCost,
        laborCost,
        total: materialCost + laborCost
      };
      
      // Calculate total estimate
      const totalEstimate = fixtureCost + plumbingCost + tilingCost.total;
      
      return {
        fixtureCost,
        plumbingCost,
        tilingCost,
        total: totalEstimate
      };
    } catch (error) {
      console.error('Error calculating estimate:', error);
      throw error;
    }
  },
  
  async saveEstimate(
    calculatorState: CalculatorState, 
    estimateResult: EstimateResult
  ): Promise<Project> {
    try {
      const projectData = {
        client_name: calculatorState.customerDetails.name,
        client_email: calculatorState.customerDetails.email,
        client_mobile: calculatorState.customerDetails.mobile,
        client_location: calculatorState.customerDetails.location,
        project_type: calculatorState.projectType,
        length: calculatorState.dimensions.length,
        width: calculatorState.dimensions.width,
        height: 9, // Fixed height
        selected_fixtures: calculatorState.fixtures,
        selected_brand: calculatorState.selectedBrand,
        timeline: calculatorState.timeline,
        fixture_cost: estimateResult.fixtureCost,
        plumbing_cost: estimateResult.plumbingCost,
        tiling_cost: estimateResult.tilingCost.total,
        final_estimate: estimateResult.total
      };
      
      return await ProjectService.createProject(projectData);
    } catch (error) {
      console.error('Error saving estimate:', error);
      throw error;
    }
  }
};
