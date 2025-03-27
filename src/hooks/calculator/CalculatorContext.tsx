
import React, { createContext, useReducer, ReactNode } from 'react';
import { CalculatorService, EstimateResult } from '@/services/calculator';
import { CalculatorState, CalculatorContextType } from './types';
import { initialState } from './initialState';
import { calculatorReducer } from './calculatorReducer';

// Create context
export const CalculatorContext = createContext<CalculatorContextType>({
  state: initialState,
  setProjectType: () => {},
  setDimensions: () =>  {},
  setFixture: () => {},
  setTimeline: () => {},
  setBrand: () => {},
  setCustomerDetails: () => {},
  calculateEstimate: async () => ({
    fixtureCost: 0,
    plumbingCost: 0,
    tilingCost: {
      materialCost: 0,
      laborCost: 0,
      total: 0
    },
    productCost: 0,
    total: 0
  }),
  goToStep: () => {},
  nextStep: () => {},
  prevStep: () => {},
  resetCalculator: () => {}
});

// Provider component
export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

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
    }
    
    dispatch({ type: 'SET_CUSTOMER_DETAILS', payload: details });
  };

  const calculateEstimate = async (): Promise<EstimateResult> => {
    try {
      console.log('Calculating estimate with state:', state);
      
      // Validate customer details before proceeding
      if (!state.customerDetails.name || !state.customerDetails.email) {
        console.error('Missing customer details. Cannot calculate estimate.');
        throw new Error('MISSING_CUSTOMER_DETAILS');
      }
      
      // Prepare calculator state for API
      const calculatorState = {
        projectType: state.projectType,
        dimensions: state.dimensions,
        fixtures: state.fixtures,
        timeline: state.timeline,
        selectedBrand: state.selectedBrand,
        customerDetails: state.customerDetails
      };
      
      // Calculate estimate using the service
      const estimateResult = await CalculatorService.calculateEstimate(calculatorState);
      console.log('Estimate calculation result:', estimateResult);
      
      // Save the estimate to database
      await CalculatorService.saveEstimate(calculatorState, estimateResult);
      
      // Update state with the calculated estimate
      dispatch({ type: 'SET_ESTIMATE', payload: estimateResult });
      
      return estimateResult;
    } catch (error) {
      console.error('Error calculating estimate:', error);
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

  return (
    <CalculatorContext.Provider
      value={{
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
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};
