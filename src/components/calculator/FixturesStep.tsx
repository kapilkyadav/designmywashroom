
import React from 'react';
import { useCalculator } from '@/hooks/calculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, ShowerHead, Lightbulb, Fan, Thermometer, Bath, Palette, Waves } from 'lucide-react';

const FixturesStep = () => {
  const { state, setFixture, nextStep, prevStep } = useCalculator();
  
  const handleFixtureChange = (category: 'electrical' | 'plumbing' | 'additional', name: string, value: boolean) => {
    setFixture(category, name, value);
  };
  
  const fixtureCategories = [
    {
      id: 'electrical',
      title: 'Electrical Fixtures',
      icon: <Zap className="h-5 w-5" />,
      options: [
        { name: 'ledMirror', label: 'LED Mirror', icon: <Lightbulb size={16} /> },
        { name: 'exhaustFan', label: 'Exhaust Fan', icon: <Fan size={16} /> },
        { name: 'waterHeater', label: 'Water Heater', icon: <Thermometer size={16} /> }
      ]
    },
    {
      id: 'plumbing',
      title: 'Plumbing Options',
      icon: <ShowerHead className="h-5 w-5" />,
      options: [
        { name: 'completePlumbing', label: 'Complete Plumbing', icon: <ShowerHead size={16} /> },
        { name: 'fixtureInstallationOnly', label: 'Fixture Installation Only', icon: <Bath size={16} /> }
      ]
    },
    {
      id: 'additional',
      title: 'Additional Fixtures',
      icon: <ShowerHead className="h-5 w-5" />,
      options: [
        { name: 'showerPartition', label: 'Shower Partition', icon: <ShowerHead size={16} /> },
        { name: 'vanity', label: 'Vanity', icon: <Palette size={16} /> },
        { name: 'bathtub', label: 'Bathtub', icon: <Bath size={16} /> },
        { name: 'jacuzzi', label: 'Jacuzzi', icon: <Waves size={16} /> }
      ]
    }
  ];
  
  const hasSelectedFixtures = () => {
    return (
      Object.values(state.fixtures.electrical).some(Boolean) ||
      Object.values(state.fixtures.plumbing).some(Boolean) ||
      Object.values(state.fixtures.additional).some(Boolean)
    );
  };
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center">Select Your Fixtures</h2>
      <p className="text-muted-foreground mb-8 text-center">
        Choose the fixtures you want to include in your washroom.
      </p>
      
      <div className="max-w-3xl mx-auto space-y-6">
        {fixtureCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="bg-secondary px-4 py-3 flex items-center">
              <div className="mr-2 text-primary">{category.icon}</div>
              <h3 className="font-medium">{category.title}</h3>
            </div>
            <Separator />
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.options.map((option) => (
                  <div key={option.name} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center">
                      <div className="mr-2 text-muted-foreground">
                        {option.icon}
                      </div>
                      <Label htmlFor={`${category.id}-${option.name}`} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                    <Switch
                      id={`${category.id}-${option.name}`}
                      checked={state.fixtures[category.id as 'electrical' | 'plumbing' | 'additional'][option.name]}
                      onCheckedChange={(checked) => handleFixtureChange(category.id as 'electrical' | 'plumbing' | 'additional', option.name, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className="flex justify-between pt-4">
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
            disabled={!hasSelectedFixtures()}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FixturesStep;
