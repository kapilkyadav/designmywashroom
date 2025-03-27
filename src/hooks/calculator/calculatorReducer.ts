
import { CalculatorState, CalculatorAction } from './types';
import { initialState } from './initialState';

// Reducer function
export const calculatorReducer = (state: CalculatorState, action: CalculatorAction): CalculatorState => {
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
      return { ...state, currentStep: state.currentStep < 7 ? state.currentStep + 1 : state.currentStep };
    case 'PREV_STEP':
      return { ...state, currentStep: state.currentStep > 1 ? state.currentStep - 1 : state.currentStep };
    case 'RESET':
      return { ...initialState, currentStep: 1 };
    default:
      return state;
  }
};
