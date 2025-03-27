
import React from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, Clock, CalendarClock } from 'lucide-react';

const TimelineStep = () => {
  const { state, setTimeline, nextStep, prevStep } = useCalculator();
  
  const handleSelect = (timeline: 'standard' | 'flexible') => {
    setTimeline(timeline);
  };
  
  const timelineOptions = [
    {
      id: 'standard',
      title: 'Standard Timeline',
      description: 'Complete your project within the standard 4-week timeline',
      icon: <Clock size={40} />,
      details: [
        'Professional team completes work in 4 weeks',
        'Dedicated project manager',
        'Structured workflow and daily progress',
        'Fixed completion date guarantee'
      ]
    },
    {
      id: 'flexible',
      title: 'Flexible Timeline',
      description: 'Extended timeline to accommodate your schedule',
      icon: <CalendarClock size={40} />,
      details: [
        'Flexible completion beyond 4 weeks',
        'Adapted to your convenience',
        'Phased implementation possible',
        'Weekend and holiday work options'
      ]
    }
  ];
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center">Select your preferred project timeline</h2>
      <p className="text-muted-foreground mb-8 text-center">Choose the timeline option that best fits your needs.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {timelineOptions.map((option) => (
          <Card 
            key={option.id}
            className={cn(
              'border-2 overflow-hidden transition-all duration-300',
              state.timeline === option.id 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/30 hover:shadow-md'
            )}
            onClick={() => handleSelect(option.id as 'standard' | 'flexible')}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "text-primary transition-all duration-300",
                  state.timeline === option.id ? "scale-110" : ""
                )}>
                  {option.icon}
                </div>
                
                {state.timeline === option.id && (
                  <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center animate-scale-in">
                    <Check size={16} />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-medium mb-2">{option.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
              
              <ul className="space-y-2 mt-4">
                {option.details.map((detail, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <div className="mr-2 mt-1 text-primary">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6">
                <Button 
                  variant={state.timeline === option.id ? "default" : "outline"} 
                  className="w-full"
                  onClick={() => handleSelect(option.id as 'standard' | 'flexible')}
                >
                  {state.timeline === option.id ? "Selected" : "Select this option"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between max-w-4xl mx-auto mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button 
          type="button" 
          onClick={nextStep}
          disabled={!state.timeline}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default TimelineStep;
