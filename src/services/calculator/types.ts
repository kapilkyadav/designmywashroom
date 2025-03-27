
import { Project } from '@/lib/supabase';

export interface CalculatorState {
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
}

export interface EstimateResult {
  fixtureCost: number;
  plumbingCost: number;
  tilingCost: {
    materialCost: number;
    laborCost: number;
    total: number;
  };
  productCost: number;
  total: number;
}
