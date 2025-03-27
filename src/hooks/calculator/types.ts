
import { EstimateResult } from '@/services/calculator';

export interface CalculatorState {
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

export type CalculatorAction =
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

export interface CalculatorContextType {
  state: CalculatorState;
  setProjectType: (type: 'new-construction' | 'renovation') => void;
  setDimensions: (dimensions: { length: number; width: number }) => void;
  setFixture: (category: 'electrical' | 'plumbing' | 'additional', name: string, value: boolean) => void;
  setTimeline: (timeline: 'standard' | 'flexible') => void;
  setBrand: (brand: string) => void;
  setCustomerDetails: (details: { name: string; email: string; mobile: string; location: string }) => void;
  calculateEstimate: () => Promise<EstimateResult>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetCalculator: () => void;
}
