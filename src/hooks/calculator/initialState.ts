
import { CalculatorState } from './types';

// Initial state for the calculator
export const initialState: CalculatorState = {
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
    productCost: 0,
    total: 0
  },
  estimateCalculated: false
};
