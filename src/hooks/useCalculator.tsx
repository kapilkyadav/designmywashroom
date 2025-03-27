
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CalculatorService, CalculatorState, EstimateResult } from '@/services/CalculatorService';

// Define state types
interface State {
  currentStep: number;
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
  estimate: EstimateResult;
  estimateCalculated: boolean;
}

// Define action types
type Action =
  | { type: 'SET_PROJECT_TYPE'; payload: 'new-construction' | 'renovation' }
  | { type: 'SET_DIMENSIONS'; payload: { length: number; width: number } }
  | { type: 'SET_FIXTURE'; payload: { category: 'electrical' | 'plumbing' | 'additional'; name: string; value: boolean } }
  | { type: 'SET_TIMELINE'; payload: 'standard' | 'flexible' }
  | { type: 'SET_BRAND'; payload: string }
  | { type: 'SET_CUSTOMER_DETAILS'; payload: { name: string; email: string; mobile: string; location: string } }
  | { type: 'SET_ESTIMATE'; payload: EstimateResult }
  | { type: 'GO_TO_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };

// Initial state
const initialState: State = {
  currentStep: 1,
  projectType: 'new-construction',
  dimensions: {
    length: 8,
    width: 6
  },
  fixtures: {
    electrical: {
      ledMirror: false,
      exhaustFan: false,
      waterHeater: false
    },
    plumbing: {
      completePlumbing: false,
      fixtureInstallationOnly: false
    },
    additional: {
      showerPartition: false,
      vanity: false,
      bathtub: false,
      jacuzzi: false
    }
  },
  timeline: 'standard',
  selectedBrand: '',
  customerDetails: {
    name: '',
    email: '',
    mobile: '',
    location: ''
  },
  estimate: {
    fixtureCost: 0,
    plumbingCost: 0,
    tilingCost: {
      materialCost: 0,
      laborCost: 0,
      total: 0
    },
    total: 0
  },
  estimateCalculated: false
};

// Create context
const CalculatorContext = createContext<{
  state: State;
  setProjectType: (type: 'new-construction' | 'renovation') => void;
  setDimensions: (dimensions: { length: number; width: number }) => void;
  setFixture: (category: 'electrical' | 'plumbing' | 'additional', name: string, value: boolean) => void;
  setTimeline: (timeline: 'standard' | 'flexible') => void;
  setBrand: (brand: string) => void;
  setCustomerDetails: (details: { name: string; email: string; mobile: string; location: string }) => void;
  calculateEstimate: () => Promise<void>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetCalculator: () => void;
}>({
  state: initialState,
  setProjectType: () => {},
  setDimensions: () => {},
  setFixture: () => {},
  setTimeline: () => {},
  setBrand: () => {},
  setCustomerDetails: () => {},
  calculateEstimate: async () => {},
  goToStep: () => {},
  nextStep: () => {},
  prevStep: () => {},
  resetCalculator: () => {}
});

// Reducer function
const calculatorReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_PROJECT_TYPE':
      return { ...state, projectType: action.payload };
    case 'SET_DIMENSIONS':
      return { ...state, dimensions: action.payload };
    case 'SET_FIXTURE':
      return {
        ...state,
        fixtures: {
          ...state.fixtures,
          [action.payload.category]: {
            ...state.fixtures[action.payload.category],
            [action.payload.name]: action.payload.value
          }
        }
      };
    case 'SET_TIMELINE':
      return { ...state, timeline: action.payload };
    case 'SET_BRAND':
      return { ...state, selectedBrand: action.payload };
    case 'SET_CUSTOMER_DETAILS':
      return { ...state, customerDetails: action.payload };
    case 'SET_ESTIMATE':
      return { 
        ...state, 
        estimate: action.payload,
        estimateCalculated: true
      };
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep < 6 ? state.currentStep + 1 : state.currentStep };
    case 'PREV_STEP':
      return { ...state, currentStep: state.currentStep > 1 ? state.currentStep - 1 : state.currentStep };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

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
    dispatch({ type: 'SET_CUSTOMER_DETAILS', payload: details });
  };

  const calculateEstimate = async () => {
    try {
      // Prepare calculator state for API
      const calculatorState: CalculatorState = {
        projectType: state.projectType,
        dimensions: state.dimensions,
        fixtures: state.fixtures,
        timeline: state.timeline,
        selectedBrand: state.selectedBrand,
        customerDetails: state.customerDetails
      };
      
      // Calculate estimate using the service
      const estimateResult = await CalculatorService.calculateEstimate(calculatorState);
      
      // Save the estimate to database
      await CalculatorService.saveEstimate(calculatorState, estimateResult);
      
      // Update state with the calculated estimate
      dispatch({ type: 'SET_ESTIMATE', payload: estimateResult });
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

// Hook to use the calculator context
export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
