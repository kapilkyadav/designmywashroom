
import { supabase, Project, Settings } from '@/lib/supabase';
import { FixtureService } from './FixtureService';
import { BrandService } from './BrandService';
import { SettingsService } from './SettingsService';
import { ProjectService } from './ProjectService';
import { ProductService } from './ProductService';

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
  productCost: number; // Added new field for product costs
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
      
      // Calculate product cost from selected brand
      let productCost = 0;
      if (calculatorState.selectedBrand) {
        try {
          const products = await ProductService.getProductsByBrandId(calculatorState.selectedBrand);
          // Sum up client_price of all products from the selected brand
          productCost = products.reduce((sum, product) => sum + (product.client_price || 0), 0);
          console.log(`Selected brand products cost: ${productCost}`);
        } catch (error) {
          console.error('Error fetching brand products:', error);
          // Continue with calculation even if product fetch fails
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
      
      // Calculate total estimate including product cost
      const totalEstimate = fixtureCost + plumbingCost + tilingCost.total + productCost;
      
      return {
        fixtureCost,
        plumbingCost,
        tilingCost,
        productCost, // Add product cost to the result
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
      // Debug data coming in
      console.log('Saving estimate with customer details:', JSON.stringify(calculatorState.customerDetails));
      
      // Verify customer details are not empty
      if (!calculatorState.customerDetails.name || !calculatorState.customerDetails.email) {
        console.error('Missing customer details. Cannot save estimate.');
        console.error('Customer details received:', calculatorState.customerDetails);
        throw new Error('MISSING_CUSTOMER_DETAILS');
      }
      
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
      
      // Log the project data being sent to the database
      console.log('Creating project with data:', JSON.stringify(projectData));
      
      // Extra verification for client information
      if (!projectData.client_name || projectData.client_name.trim() === '') {
        console.error('Client name is empty. Setting placeholder value to prevent database issues.');
        projectData.client_name = 'Unknown Client';
      }
      
      if (!projectData.client_email || projectData.client_email.trim() === '') {
        console.error('Client email is empty. Setting placeholder value to prevent database issues.');
        projectData.client_email = 'no-email@example.com';
      }
      
      if (!projectData.client_mobile || projectData.client_mobile.trim() === '') {
        console.error('Client mobile is empty. Setting placeholder value to prevent database issues.');
        projectData.client_mobile = '0000000000';
      }
      
      if (!projectData.client_location || projectData.client_location.trim() === '') {
        console.error('Client location is empty. Setting placeholder value to prevent database issues.');
        projectData.client_location = 'Unknown Location';
      }
      
      return await ProjectService.createProject(projectData);
    } catch (error) {
      console.error('Error saving estimate:', error);
      throw error;
    }
  }
};
