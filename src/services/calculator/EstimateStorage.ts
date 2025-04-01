
import { ProjectService } from '@/services/ProjectService';
import { Project } from '@/lib/supabase';
import { CalculatorState, EstimateResult } from './types';
import { toast } from 'sonner';

export class EstimateStorage {
  /**
   * Save the calculated estimate to the database
   */
  async saveEstimate(
    calculatorState: CalculatorState, 
    estimateResult: EstimateResult
  ): Promise<Project> {
    try {
      // Extra debug check to see what we're getting
      console.log('Saving estimate with full calculator state:', JSON.stringify(calculatorState));
      
      // Perform strict validation of customer details
      if (!calculatorState.customerDetails) {
        console.error('Customer details object is undefined or null');
        toast.error("Missing customer information", {
          description: "Customer details are missing. Please try again."
        });
        throw new Error('MISSING_CUSTOMER_DETAILS');
      }
      
      const { name, email, mobile, location } = calculatorState.customerDetails;
      
      // Enhanced validation - log specific missing fields
      let missingFields = [];
      
      if (!name || name.trim() === '') {
        console.error('Customer name is empty or missing');
        missingFields.push('name');
      }
      
      if (!email || email.trim() === '') {
        console.error('Customer email is empty or missing');
        missingFields.push('email');
      }
      
      if (!mobile || mobile.trim() === '') {
        console.error('Customer mobile is empty or missing');
        missingFields.push('mobile');
      }
      
      if (!location || location.trim() === '') {
        console.error('Customer location is empty or missing');
        missingFields.push('location');
      }
      
      if (missingFields.length > 0) {
        const errorMessage = `Missing customer details: ${missingFields.join(', ')}`;
        console.error(errorMessage);
        toast.error("Incomplete information", {
          description: `Please provide your ${missingFields.join(', ')}.`
        });
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
      
      // Log the sanitized project data being sent to the database
      console.log('Creating project with sanitized data:', JSON.stringify(projectData));
      
      // Double-check one more time
      if (!projectData.client_name || !projectData.client_email) {
        console.error('Final validation failed. Missing required fields:', {
          name: projectData.client_name,
          email: projectData.client_email
        });
        toast.error("Missing information", {
          description: "Please provide your name and email to continue."
        });
        throw new Error('MISSING_CUSTOMER_DETAILS');
      }
      
      try {
        const result = await ProjectService.createProject(projectData);
        console.log('Project created successfully:', result);
        toast.success("Estimate calculated successfully", {
          description: "Your washroom estimate has been saved."
        });
        return result;
      } catch (dbError: any) {
        console.error('Database error when creating project:', dbError);
        toast.error("Database Error", {
          description: "There was a problem saving your estimate. Please try again."
        });
        throw new Error('DATABASE_ERROR');
      }
    } catch (error) {
      console.error('Error saving estimate:', error);
      if (error instanceof Error) {
        if (error.message !== 'MISSING_CUSTOMER_DETAILS' && 
            error.message !== 'DATABASE_ERROR') {
          toast.error("Unexpected Error", {
            description: "There was a problem processing your request. Please try again."
          });
        }
      } else {
        toast.error("Unknown Error", {
          description: "An unknown error occurred. Please try again."
        });
      }
      throw error;
    }
  }
}

// Create a singleton instance
export const estimateStorage = new EstimateStorage();
