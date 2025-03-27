
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
}

// Create a singleton instance
export const estimateStorage = new EstimateStorage();
