
import React from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import StepIndicator from '@/components/ui/StepIndicator';
import ProjectTypeStep from './ProjectTypeStep';
import DimensionsStep from './DimensionsStep';
import FixturesStep from './FixturesStep';
import TimelineStep from './TimelineStep';
import BrandsStep from './BrandsStep';
import CustomerDetailsStep from './CustomerDetailsStep';
import Summary from './Summary';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const CalculatorForm = () => {
  const { state, goToStep } = useCalculator();
  
  const stepComponents = [
    ProjectTypeStep,
    DimensionsStep,
    FixturesStep,
    TimelineStep,
    BrandsStep,
    CustomerDetailsStep,
  ];
  
  const stepLabels = [
    'Project Type',
    'Dimensions',
    'Fixtures',
    'Timeline',
    'Brands',
    'Your Details'
  ];
  
  const renderStep = () => {
    if (state.estimateCalculated) {
      return <Summary />;
    }
    
    const CurrentStepComponent = stepComponents[state.currentStep - 1];
    return <CurrentStepComponent />;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {!state.estimateCalculated && (
        <div className="max-w-3xl mx-auto mb-10">
          <StepIndicator 
            currentStep={state.currentStep} 
            totalSteps={stepComponents.length}
            labels={stepLabels}
            onStepClick={goToStep}
            className="mb-4"
          />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ArrowLeft size={14} />
              <span>Previous</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Next</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      )}
      
      <div className={cn(
        "transition-opacity duration-500",
        state.estimateCalculated ? "opacity-100" : ""
      )}>
        {renderStep()}
      </div>
    </div>
  );
};

export default CalculatorForm;
