
import React from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import ProjectTypeStep from './ProjectTypeStep';
import DimensionsStep from './DimensionsStep';
import FixturesStep from './FixturesStep';
import TimelineStep from './TimelineStep';
import BrandSelectionStep from './BrandSelectionStep';
import CustomerDetailsStep from './CustomerDetailsStep';
import Summary from './Summary';

const CalculatorForm = () => {
  const { state } = useCalculator();
  
  // Render the appropriate step based on the current step in the state
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <ProjectTypeStep />;
      case 2:
        return <DimensionsStep />;
      case 3:
        return <FixturesStep />;
      case 4:
        return <TimelineStep />;
      case 5:
        return <BrandSelectionStep />;
      case 6:
        return <CustomerDetailsStep />;
      case 7:
        return <Summary />;
      default:
        return <ProjectTypeStep />;
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Progress bar - Show only for steps 1-6 */}
      {state.currentStep < 7 && (
        <div className="max-w-4xl mx-auto">
          <div className="relative h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${(state.currentStep / 6) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Project Type</span>
            <span>Dimensions</span>
            <span>Fixtures</span>
            <span>Timeline</span>
            <span>Brand</span>
            <span>Contact</span>
          </div>
        </div>
      )}
      
      {/* Step content */}
      <div className="pb-12">
        {renderStep()}
      </div>
    </div>
  );
};

export default CalculatorForm;
