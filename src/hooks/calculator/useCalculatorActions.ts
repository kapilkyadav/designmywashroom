
import { useReducer, useRef, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { CalculatorService, EstimateResult } from '@/services/calculator';
import { CalculatorState, CalculatorContextType } from './types';
import { initialState } from './initialState';
import { calculatorReducer } from './calculatorReducer';

export const useCalculatorActions = (): CalculatorContextType => {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  // Use a ref to track the latest customer details to avoid state sync issues
  const customerDetailsRef = useRef(initialState.customerDetails);

  // Synchronize the ref whenever state.customerDetails changes
  useEffect(() => {
    if (state.customerDetails) {
      customerDetailsRef.current = state.customerDetails;
      console.log('CustomerDetails state updated, ref synced:', state.customerDetails);
    }
  }, [state.customerDetails]);

  const setProjectType = (type: 'new-construction' | 'renovation') => {
    dispatch({ type: 'SET_PROJECT_TYPE', payload: type });
  };

  const setDimensions = (dimensions: { length: number; width: number }) => {
    dispatch({ type: 'SET_DIMENSIONS', payload: dimensions });
  };

  const setFixture = (category: 'electrical' | 'plumbing' | 'additional', name: string, value: boolean) => {
    dispatch({ type: 'SET_FIXTURE', payload: { category, name, value } });
  };

  const setTimeline = (timeline: 'standard' | 'flexible') => {
    dispatch({ type: 'SET_TIMELINE', payload: timeline });
  };

  const setBrand = (brand: string) => {
    dispatch({ type: 'SET_BRAND', payload: brand });
  };

  const setCustomerDetails = (details: { name: string; email: string; mobile: string; location: string }) => {
    console.log('Setting customer details in context:', details);
    
    // Validate that required fields are not empty
    if (!details.name || !details.email) {
      console.warn('Attempted to set customer details with missing required fields:', details);
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide your name and email to continue."
      });
      return; // Don't proceed with empty values
    }
    
    // Update our ref immediately with the latest details
    customerDetailsRef.current = details;
    console.log('Customer details ref updated:', customerDetailsRef.current);
    
    // Apply the update to the state
    dispatch({ type: 'SET_CUSTOMER_DETAILS', payload: details });
  };

  const calculateEstimate = async (): Promise<EstimateResult> => {
    try {
      // Always use the most up-to-date customer details from our ref
      const customerDetails = customerDetailsRef.current;
      console.log('Calculating estimate with customerDetails from ref:', customerDetails);
      
      // Double-check customer details before proceeding
      if (!customerDetails || !customerDetails.name || !customerDetails.email) {
        console.error('Missing customer details. Cannot calculate estimate.', customerDetails);
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please provide your name and email to continue."
        });
        throw new Error('MISSING_CUSTOMER_DETAILS');
      }
      
      // Prepare calculator state for API using the latest state and customer details from ref
      const calculatorState = {
        projectType: state.projectType,
        dimensions: state.dimensions,
        fixtures: state.fixtures,
        timeline: state.timeline,
        selectedBrand: state.selectedBrand,
        customerDetails: customerDetails
      };
      
      console.log('Sending calculator state to API:', JSON.stringify(calculatorState));
      
      // Calculate estimate using the service
      let estimateResult;
      try {
        estimateResult = await CalculatorService.calculateEstimate(calculatorState);
        console.log('Estimate calculation result:', estimateResult);
      } catch (error) {
        console.error('Error calculating estimate in service:', error);
        toast({
          variant: "destructive",
          title: "Calculation Error",
          description: "There was a problem calculating your estimate. Please try again."
        });
        throw error;
      }
      
      // Save the estimate to database
      try {
        await CalculatorService.saveEstimate(calculatorState, estimateResult);
        console.log('Estimate saved successfully to database');
      } catch (error: any) {
        console.error('Error saving estimate to database:', error);
        if (error.message === 'MISSING_CUSTOMER_DETAILS') {
          toast({
            variant: "destructive",
            title: "Missing information",
            description: "Please provide your name and email to continue."
          });
          throw error; // Re-throw to prevent continuing
        } else if (error.message === 'RATE_LIMITED') {
          toast({
            variant: "destructive",
            title: "Too many requests",
            description: "Please wait a few minutes before submitting again."
          });
          throw error; // Re-throw to prevent continuing
        } else {
          // For other errors, show warning but continue
          console.warn('Estimate calculated but not saved to database:', error);
          toast({
            variant: "default",
            title: "Warning",
            description: "Your estimate was calculated but couldn't be saved. You can still view it."
          });
        }
      }
      
      // Update state with the calculated estimate
      dispatch({ type: 'SET_ESTIMATE', payload: estimateResult });
      
      return estimateResult;
    } catch (error) {
      console.error('Error in calculateEstimate method:', error);
      throw error;
    }
  };

  const goToStep = (step: number) => {
    dispatch({ type: 'GO_TO_STEP', payload: step });
  };

  const nextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const prevStep = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const resetCalculator = () => {
    dispatch({ type: 'RESET' });
  };

  return {
    state,
    setProjectType,
    setDimensions,
    setFixture,
    setTimeline,
    setBrand,
    setCustomerDetails,
    calculateEstimate,
    goToStep,
    nextStep,
    prevStep,
    resetCalculator
  };
};
