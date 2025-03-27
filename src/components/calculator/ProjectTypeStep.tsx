
import React from 'react';
import { useCalculator } from '@/hooks/calculator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const ProjectTypeStep = () => {
  const { state, setProjectType, nextStep } = useCalculator();
  
  const handleSelect = (type: 'new-construction' | 'renovation') => {
    setProjectType(type);
    nextStep();
  };
  
  const projectTypes = [
    {
      id: 'new-construction',
      title: 'New Construction',
      description: 'Building a completely new washroom from scratch',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
    },
    {
      id: 'renovation',
      title: 'Renovation',
      description: 'Upgrading or redesigning an existing washroom',
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M20 7h-9" />
          <path d="M14 17H5" />
          <circle cx="8" cy="7" r="3" />
          <circle cx="17" cy="17" r="3" />
        </svg>
      ),
    },
  ];
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center">What type of project are you planning?</h2>
      <p className="text-muted-foreground mb-8 text-center">Select the option that best describes your washroom project.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {projectTypes.map((type) => (
          <ProjectTypeCard 
            key={type.id}
            id={type.id as 'new-construction' | 'renovation'}
            title={type.title}
            description={type.description}
            icon={type.icon}
            isSelected={state.projectType === type.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
};

interface ProjectTypeCardProps {
  id: 'new-construction' | 'renovation';
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: (type: 'new-construction' | 'renovation') => void;
}

const ProjectTypeCard = ({ 
  id, 
  title, 
  description, 
  icon, 
  isSelected, 
  onSelect 
}: ProjectTypeCardProps) => {
  return (
    <Card 
      className={cn(
        'border-2 cursor-pointer overflow-hidden transition-all duration-300 h-full',
        isSelected 
          ? 'border-primary ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/30 hover:shadow-md'
      )}
      onClick={() => onSelect(id)}
    >
      <div className="p-6 flex flex-col items-center text-center h-full">
        <div className={cn(
          'mb-4 text-primary/80 transition-transform duration-300',
          isSelected ? 'scale-110' : ''
        )}>
          {icon}
        </div>
        
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        
        <div className="mt-auto">
          <Button 
            variant={isSelected ? "default" : "outline"} 
            className="group relative"
          >
            <span className={cn(
              "transition-all duration-300 group-hover:pr-4",
              isSelected ? "pr-4" : ""
            )}>
              {isSelected ? "Selected" : "Select"}
            </span>
            {isSelected && (
              <Check className="w-4 h-4 absolute right-4 opacity-100 transition-opacity duration-300" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProjectTypeStep;
