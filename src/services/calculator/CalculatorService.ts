
import { CalculatorState, EstimateResult } from './types';
import { estimationService } from './EstimationService';
import { estimateStorage } from './EstimateStorage';

export class CalculatorService {
  /**
   * Calculate an estimate based on the calculator state
   */
  async calculateEstimate(calculatorState: CalculatorState): Promise<EstimateResult> {
    try {
      return await estimationService.calculateEstimate(calculatorState);
    } catch (error) {
      console.error('Error calculating estimate:', error);
      throw error;
    }
  }
  
  /**
   * Save the calculated estimate to the database
   */
  async saveEstimate(
    calculatorState: CalculatorState, 
    estimateResult: EstimateResult
  ) {
    return await estimateStorage.saveEstimate(calculatorState, estimateResult);
  }
}

// Create a singleton instance
export const calculatorService = new CalculatorService();
