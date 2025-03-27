
import { ProjectService } from '@/services/ProjectService';
import { Project } from '@/lib/supabase';
import { CalculatorState, EstimateResult } from './types';

export class EstimateStorage {
  /**
   * Save the calculated estimate to the database
   */
  async saveEstimate(
    calculatorState: CalculatorState, 
    estimateResult: EstimateResult
  ): Promise<Project> {
    try {
      // Debug data coming in
      console.log('Saving estimate with customer details:', JSON.stringify(calculatorState.customerDetails));
      
      // Perform strict validation of customer details
      if (!calculatorState.customerDetails) {
        console.error('Customer details object is undefined.');
        throw new Error('MISSING_CUSTOMER_DETAILS');
      }
      
      const { name, email, mobile, location } = calculatorState.customerDetails;
      
      // Verify customer details are not empty
      if (!name || name.trim() === '') {
        console.error('Customer name is empty or missing.');
        throw new Error('MISSING_CUSTOMER_DETAILS');
      }
      
      if (!email || email.trim() === '') {
        console.error('Customer email is empty or missing.');
        throw new Error('MISSING_CUSTOMER_DETAILS');
      }
      
      if (!mobile || mobile.trim() === '') {
        console.error('Customer mobile is empty or missing.');
        throw new Error('MISSING_CUSTOMER_DETAILS');
      }
      
      if (!location || location.trim() === '') {
        console.error('Customer location is empty or missing.');
        throw new Error('MISSING_CUSTOMER_DETAILS');
      }
      
      const projectData = {
        client_name: name.trim(),
        client_email: email.trim(),
        client_mobile: mobile.trim(),
        client_location: location.trim(),
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
      
      return await ProjectService.createProject(projectData);
    } catch (error) {
      console.error('Error saving estimate:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const estimateStorage = new EstimateStorage();
