
import React, { createContext, ReactNode } from 'react';
import { CalculatorState, CalculatorContextType } from './types';
import { initialState } from './initialState';
import { useCalculatorActions } from './useCalculatorActions';

// Create context with default values
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
  // Use the custom hook to get all calculator actions and state
  const calculatorContext = useCalculatorActions();
  
  return (
    <CalculatorContext.Provider value={calculatorContext}>
      {children}
    </CalculatorContext.Provider>
  );
};
