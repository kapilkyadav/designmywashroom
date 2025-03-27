
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Types for our calculator data
export interface CalculatorState {
  // Step 1: Project Type
  projectType: 'new-construction' | 'renovation' | '';
  
  // Step 2: Dimensions
  dimensions: {
    length: number;
    width: number;
  };
  
  // Step 3: Fixtures
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
  
  // Step 4: Timeline
  timeline: 'standard' | 'flexible' | '';
  
  // Step 5: Brand
  selectedBrand: string;
  
  // Step 6: Customer Details
  customerDetails: {
    name: string;
    email: string;
    mobile: string;
    location: string;
  };
  
  // Step tracking
  currentStep: number;
  
  // Final calculated estimate (hidden from user until end)
  estimateCalculated: boolean;
  estimate: {
    fixtureCost: number;
    plumbingCost: number;
    tilingCost: {
      materialCost: number;
      laborCost: number;
      total: number;
    };
    total: number;
  };
}

// Initial state for the calculator
const initialCalculatorState: CalculatorState = {
  projectType: '',
  dimensions: {
    length: 0,
    width: 0,
  },
  fixtures: {
    electrical: {
      ledMirror: false,
      exhaustFan: false,
      waterHeater: false,
    },
    plumbing: {
      completePlumbing: false,
      fixtureInstallationOnly: false,
    },
    additional: {
      showerPartition: false,
      vanity: false,
      bathtub: false,
      jacuzzi: false,
    },
  },
  timeline: '',
  selectedBrand: '',
  customerDetails: {
    name: '',
    email: '',
    mobile: '',
    location: '',
  },
  currentStep: 1,
  estimateCalculated: false,
  estimate: {
    fixtureCost: 0,
    plumbingCost: 0,
    tilingCost: {
      materialCost: 0,
      laborCost: 0,
      total: 0,
    },
    total: 0,
  },
};

// Context type with state and updater functions
interface CalculatorContextType {
  state: CalculatorState;
  setProjectType: (type: 'new-construction' | 'renovation') => void;
  setDimensions: (dimensions: { length: number; width: number }) => void;
  setFixture: (
    category: 'electrical' | 'plumbing' | 'additional',
    name: string,
    value: boolean
  ) => void;
  setTimeline: (timeline: 'standard' | 'flexible') => void;
  setBrand: (brand: string) => void;
  setCustomerDetails: (details: {
    name: string;
    email: string;
    mobile: string;
    location: string;
  }) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  calculateEstimate: () => void;
  resetCalculator: () => void;
}

// Create context with default value
const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

// Provider component
export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CalculatorState>(() => {
    // Check if we have saved state in session storage
    const savedState = sessionStorage.getItem('calculatorState');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error("Failed to parse saved calculator state", e);
      }
    }
    return initialCalculatorState;
  });

  // Save state to session storage when it changes
  useEffect(() => {
    sessionStorage.setItem('calculatorState', JSON.stringify(state));
  }, [state]);

  // Mock the actual calculation function (in a real app, this would use actual pricing data)
  const calculateEstimate = () => {
    // For demo purposes - these would normally come from the backend
    const FIXTURE_PRICES = {
      ledMirror: 3500,
      exhaustFan: 1200,
      waterHeater: 8000,
      completePlumbing: 15000,
      fixtureInstallationOnly: 7500,
      showerPartition: 12000,
      vanity: 9000,
      bathtub: 25000,
      jacuzzi: 45000,
    };
    
    const PLUMBING_RATE_PER_SQFT = 150;
    const TILE_COST_PER_TILE = 80;
    const TILING_LABOR_RATE_PER_SQFT = 85;
    
    // Calculate fixture costs
    let fixtureCost = 0;
    
    // Add electrical fixtures
    if (state.fixtures.electrical.ledMirror) fixtureCost += FIXTURE_PRICES.ledMirror;
    if (state.fixtures.electrical.exhaustFan) fixtureCost += FIXTURE_PRICES.exhaustFan;
    if (state.fixtures.electrical.waterHeater) fixtureCost += FIXTURE_PRICES.waterHeater;
    
    // Add plumbing fixtures
    if (state.fixtures.plumbing.completePlumbing) fixtureCost += FIXTURE_PRICES.completePlumbing;
    if (state.fixtures.plumbing.fixtureInstallationOnly) fixtureCost += FIXTURE_PRICES.fixtureInstallationOnly;
    
    // Add additional fixtures
    if (state.fixtures.additional.showerPartition) fixtureCost += FIXTURE_PRICES.showerPartition;
    if (state.fixtures.additional.vanity) fixtureCost += FIXTURE_PRICES.vanity;
    if (state.fixtures.additional.bathtub) fixtureCost += FIXTURE_PRICES.bathtub;
    if (state.fixtures.additional.jacuzzi) fixtureCost += FIXTURE_PRICES.jacuzzi;
    
    // Log the current state
    console.log("Current state when calculating estimate:", state);
    
    // Ensure dimensions exist and are not NaN
    const length = typeof state.dimensions.length === 'number' ? state.dimensions.length : 0;
    const width = typeof state.dimensions.width === 'number' ? state.dimensions.width : 0;
    
    if (length === 0 || width === 0) {
      console.warn("Invalid dimensions detected:", {length, width});
    }
    
    // Calculate plumbing cost
    const floorArea = length * width;
    const plumbingCost = floorArea * PLUMBING_RATE_PER_SQFT;
    
    // Calculate tiling cost
    const wallHeight = 9; // Fixed at 9 feet
    const wallArea = 2 * (length + width) * wallHeight;
    const totalTilingArea = floorArea + wallArea;
    
    // Each 2x2 tile covers 4 sq. ft.
    const initialTileCount = Math.ceil(totalTilingArea / 4);
    // Add 10% for breakage
    const finalTileCount = Math.ceil(initialTileCount * 1.1);
    
    const tileMaterialCost = finalTileCount * TILE_COST_PER_TILE;
    const tilingLaborCost = totalTilingArea * TILING_LABOR_RATE_PER_SQFT;
    const totalTilingCost = tileMaterialCost + tilingLaborCost;
    
    // Calculate total estimate
    const totalEstimate = fixtureCost + plumbingCost + totalTilingCost;
    
    console.log("Calculation dimensions:", {
      length, 
      width, 
      floorArea, 
      wallArea, 
      totalEstimate
    });
    
    setState((prevState) => ({
      ...prevState,
      estimateCalculated: true,
      estimate: {
        fixtureCost,
        plumbingCost,
        tilingCost: {
          materialCost: tileMaterialCost,
          laborCost: tilingLaborCost,
          total: totalTilingCost,
        },
        total: totalEstimate,
      },
    }));
  };

  // Utility functions to update the state
  const setProjectType = (type: 'new-construction' | 'renovation') => {
    setState({ ...state, projectType: type });
  };

  const setDimensions = (dimensions: { length: number; width: number }) => {
    console.log("Setting dimensions in context:", dimensions);
    
    // Validate dimensions to ensure they are proper numbers
    const length = isNaN(dimensions.length) ? 0 : dimensions.length;
    const width = isNaN(dimensions.width) ? 0 : dimensions.width;
    
    setState((prevState) => ({
      ...prevState,
      dimensions: { length, width }
    }));
  };

  const setFixture = (
    category: 'electrical' | 'plumbing' | 'additional',
    name: string,
    value: boolean
  ) => {
    setState({
      ...state,
      fixtures: {
        ...state.fixtures,
        [category]: {
          ...state.fixtures[category],
          [name]: value,
        },
      },
    });
  };

  const setTimeline = (timeline: 'standard' | 'flexible') => {
    setState({ ...state, timeline });
  };

  const setBrand = (brand: string) => {
    setState({ ...state, selectedBrand: brand });
  };

  const setCustomerDetails = (details: {
    name: string;
    email: string;
    mobile: string;
    location: string;
  }) => {
    setState({ ...state, customerDetails: details });
  };

  const nextStep = () => {
    if (state.currentStep < 6) {
      setState({ ...state, currentStep: state.currentStep + 1 });
    }
  };

  const prevStep = () => {
    if (state.currentStep > 1) {
      setState({ ...state, currentStep: state.currentStep - 1 });
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 6) {
      setState({ ...state, currentStep: step });
    }
  };

  const resetCalculator = () => {
    sessionStorage.removeItem('calculatorState');
    setState(initialCalculatorState);
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
        nextStep,
        prevStep,
        goToStep,
        calculateEstimate,
        resetCalculator,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
}

// Custom hook to use the calculator context
export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
}
