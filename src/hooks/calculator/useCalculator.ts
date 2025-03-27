
import { useContext } from 'react';
import { CalculatorContext } from './CalculatorContext';

// Hook to use the calculator context
export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
