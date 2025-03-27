
import React from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const FixturesStep = () => {
  const { state, setFixture, nextStep, prevStep } = useCalculator();

  const fixtures = {
    electrical: [
      {
        id: 'ledMirror',
        name: 'LED Mirror',
        description: 'Illuminated mirror with built-in LED lighting',
        icon: (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
        ),
      },
      {
        id: 'exhaustFan',
        name: 'Exhaust Fan',
        description: 'Ventilation fan to remove moisture and odors',
        icon: (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 2v1"></path>
            <path d="M12 21v1"></path>
            <path d="M4.22 4.22l.77.77"></path>
            <path d="M19.01 19.01l.77.77"></path>
            <path d="M2 12h1"></path>
            <path d="M21 12h1"></path>
            <path d="M4.22 19.78l.77-.77"></path>
            <path d="M19.01 4.99l.77-.77"></path>
            <circle cx="12" cy="12" r="7"></circle>
          </svg>
        ),
      },
      {
        id: 'waterHeater',
        name: 'Water Heater',
        description: 'Electric water heating system for hot water supply',
        icon: (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"></path>
            <path d="M12 6v12"></path>
            <path d="M8 14h8"></path>
          </svg>
        ),
      },
    ],
    plumbing: [
      {
        id: 'completePlumbing',
        name: 'Complete Plumbing',
        description: 'Full plumbing system installation or renovation',
        icon: (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 22V8"></path>
            <path d="m5 12 7-4 7 4"></path>
            <path d="M5 18a2 2 0 0 1 0-4h14a2 2 0 0 1 0 4"></path>
            <path d="M8 9v.01"></path>
            <path d="M16 9v.01"></path>
          </svg>
        ),
      },
      {
        id: 'fixtureInstallationOnly',
        name: 'Fixture Installation Only',
        description: 'Installation of plumbing fixtures without pipe work',
        icon: (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 22a8 8 0 0 0 8-8"></path>
            <path d="M2 14h12"></path>
            <path d="M20 2 2 20"></path>
          </svg>
        ),
      },
    ],
    additional: [
      {
        id: 'showerPartition',
        name: 'Shower Partition',
        description: 'Glass or acrylic shower enclosure',
        icon: (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M4 22V4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v18H4Z"></path>
            <path d="M2 22h20"></path>
            <path d="M10 22V2"></path>
          </svg>
        ),
      },
      {
        id: 'vanity',
        name: 'Vanity',
        description: 'Washroom cabinet with sink and storage',
        icon: (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect width="20" height="12" x="2" y="4" rx="2"></rect>
            <path d="M2 8h20"></path>
            <path d="M6 16v4"></path>
            <path d="M18 16v4"></path>
          </svg>
        ),
      },
      {
        id: 'bathtub',
        name: 'Bathtub',
        description: 'Standard bathtub installation',
        icon: (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M8 2v2"></path>
            <path d="M12 2v2"></path>
            <path d="M16 2v2"></path>
            <path d="M2 8h20"></path>
            <path d="M2 14h20"></path>
            <path d="M4 8v10a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8"></path>
          </svg>
        ),
      },
      {
        id: 'jacuzzi',
        name: 'Jacuzzi',
        description: 'Luxury spa tub with jets',
        icon: (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M5 5C7 5 9 5 11 5.5C13 6 13 6.5 15 6.5C17 6.5 19 6 21 5.5"></path>
            <path d="M3 9C5 9 7 9 9 9.5C11 10 13 10.5 15 10.5C17 10.5 19 10 21 9.5"></path>
            <path d="M3 13C5 13 7 13 9 13.5C11 14 13 14.5 15 14.5C17 14.5 19 14 21 13.5"></path>
            <path d="M3 17C5 17 7 17 9 17.5C11 18 13 18.5 15 18.5C17 18.5 19 18 21 17.5"></path>
          </svg>
        ),
      },
    ],
  };

  const handleContinue = () => {
    nextStep();
  };

  const hasSelectedFixtures = () => {
    return (
      Object.values(state.fixtures.electrical).some(Boolean) ||
      Object.values(state.fixtures.plumbing).some(Boolean) ||
      Object.values(state.fixtures.additional).some(Boolean)
    );
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center">Select the fixtures for your washroom</h2>
      <p className="text-muted-foreground mb-8 text-center">Choose the fixtures you'd like to include in your washroom design.</p>

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                <path d="M1.42 9.42a16 16 0 0 1 21.16 0"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12" y2="20"></line>
              </svg>
            </div>
            <h3 className="text-xl font-medium">Electrical Fixtures</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fixtures.electrical.map((fixture) => (
              <FixtureCard
                key={fixture.id}
                id={fixture.id}
                category="electrical"
                name={fixture.name}
                description={fixture.description}
                icon={fixture.icon}
                isSelected={state.fixtures.electrical[fixture.id as keyof typeof state.fixtures.electrical]}
                onSelect={(value) => setFixture('electrical', fixture.id, value)}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M10 10c1.5 1.5 3.5 1.5 5 0"></path>
                <path d="M5.5 13.5C7 15 9 15 10.5 13.5"></path>
                <path d="M14.5 13.5c1.5 1.5 3.5 1.5 5 0"></path>
                <path d="M2 17c1.5 1.5 3.5 1.5 5 0"></path>
                <path d="M17 17c1.5 1.5 3.5 1.5 5 0"></path>
                <path d="M22 10c0-5-3.5-8-10-8S2 5 2 10s1 18 10 18 10-13 10-18"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium">Plumbing Options</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fixtures.plumbing.map((fixture) => (
              <FixtureCard
                key={fixture.id}
                id={fixture.id}
                category="plumbing"
                name={fixture.name}
                description={fixture.description}
                icon={fixture.icon}
                isSelected={state.fixtures.plumbing[fixture.id as keyof typeof state.fixtures.plumbing]}
                onSelect={(value) => setFixture('plumbing', fixture.id, value)}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M12 8v8"></path>
                <path d="M8 12h8"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium">Additional Fixtures</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fixtures.additional.map((fixture) => (
              <FixtureCard
                key={fixture.id}
                id={fixture.id}
                category="additional"
                name={fixture.name}
                description={fixture.description}
                icon={fixture.icon}
                isSelected={state.fixtures.additional[fixture.id as keyof typeof state.fixtures.additional]}
                onSelect={(value) => setFixture('additional', fixture.id, value)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
          >
            Back
          </Button>
          <Button 
            type="button" 
            onClick={handleContinue}
            disabled={!hasSelectedFixtures()}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

interface FixtureCardProps {
  id: string;
  category: 'electrical' | 'plumbing' | 'additional';
  name: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: (value: boolean) => void;
}

const FixtureCard = ({
  id,
  category,
  name,
  description,
  icon,
  isSelected,
  onSelect,
}: FixtureCardProps) => {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300',
        isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border hover:border-primary/30 hover:shadow-sm'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "mt-1 rounded-md p-1.5",
            isSelected ? "text-primary" : "text-muted-foreground"
          )}>
            {icon}
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <Label
                htmlFor={`${category}-${id}`}
                className="text-base font-medium cursor-pointer"
              >
                {name}
              </Label>
              <Checkbox
                id={`${category}-${id}`}
                checked={isSelected}
                onCheckedChange={onSelect}
                className="mt-1"
              />
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FixturesStep;
