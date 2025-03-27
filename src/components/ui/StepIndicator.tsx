
import React from 'react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  onStepClick?: (step: number) => void;
  className?: string;
}

const StepIndicator = ({
  currentStep,
  totalSteps,
  labels,
  onStepClick,
  className
}: StepIndicatorProps) => {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="relative flex justify-between items-center">
        {/* Progress Line */}
        <div className="absolute h-0.5 bg-border w-full" />
        <div 
          className="absolute h-0.5 bg-primary transition-all duration-500 ease-in-out" 
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Step Dots */}
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div 
              key={index}
              className="z-10 flex flex-col items-center cursor-pointer"
              onClick={() => onStepClick && onStepClick(stepNumber)}
            >
              <div 
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300',
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground',
                  isCurrent && 'ring-4 ring-primary/20'
                )}
              >
                <span className="text-xs font-medium">{stepNumber}</span>
              </div>
              
              {labels && (
                <span 
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors duration-300 whitespace-nowrap',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {labels[index]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
