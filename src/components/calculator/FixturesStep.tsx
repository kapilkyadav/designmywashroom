
import React, { useEffect, useState } from 'react';
import { useCalculator } from '@/hooks/calculator';
import { FixtureService } from '@/services/FixtureService';
import { Fixture } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Zap, ShowerHead, Lightbulb, Fan, Thermometer, Bath, Palette, Waves } from 'lucide-react';

const FixturesStep = () => {
  const { state, setFixture, nextStep, prevStep } = useCalculator();
  const [electricalFixtures, setElectricalFixtures] = useState<Fixture[]>([]);
  const [plumbingFixtures, setPlumbingFixtures] = useState<Fixture[]>([]);
  const [additionalFixtures, setAdditionalFixtures] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch fixtures from database on component mount
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        setIsLoading(true);
        const electrical = await FixtureService.getFixturesByCategory('electrical');
        const plumbing = await FixtureService.getFixturesByCategory('plumbing');
        const additional = await FixtureService.getFixturesByCategory('additional');
        
        setElectricalFixtures(electrical);
        setPlumbingFixtures(plumbing);
        setAdditionalFixtures(additional);
        
        console.log('Fixtures loaded:', { electrical, plumbing, additional });
      } catch (error) {
        console.error('Error loading fixtures:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFixtures();
  }, []);
  
  const handleFixtureChange = (category: 'electrical' | 'plumbing' | 'additional', name: string, value: boolean) => {
    setFixture(category, name, value);
  };
  
  const handlePlumbingChange = (value: string) => {
    // Reset all plumbing options first
    Object.keys(state.fixtures.plumbing).forEach(key => {
      setFixture('plumbing', key, false);
    });
    
    // Set the selected option to true
    setFixture('plumbing', value, true);
  };
  
  const getFixtureName = (fixtures: Fixture[], fixtureKey: string): string => {
    // Find fixture by key and return its display name from the database
    const fixture = fixtures.find(f => 
      f.name.toLowerCase().includes(fixtureKey.toLowerCase())
    );
    
    if (fixture) {
      return fixture.name;
    }
    
    // Fallback to formatted key if fixture not found
    return fixtureKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };
  
  // Find the selected plumbing option for the radio group
  const getSelectedPlumbingOption = (): string => {
    const plumbingOptions = Object.entries(state.fixtures.plumbing);
    const selectedOption = plumbingOptions.find(([_, value]) => value);
    return selectedOption ? selectedOption[0] : '';
  };
  
  const hasSelectedFixtures = () => {
    return (
      Object.values(state.fixtures.electrical).some(Boolean) ||
      Object.values(state.fixtures.plumbing).some(Boolean) ||
      Object.values(state.fixtures.additional).some(Boolean)
    );
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Loading fixtures...</div>;
  }
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center">Select Your Fixtures</h2>
      <p className="text-muted-foreground mb-8 text-center">
        Choose the fixtures you want to include in your washroom.
      </p>
      
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Electrical Fixtures */}
        <Card className="overflow-hidden">
          <div className="bg-secondary px-4 py-3 flex items-center">
            <div className="mr-2 text-primary"><Zap className="h-5 w-5" /></div>
            <h3 className="font-medium">Electrical Fixtures</h3>
          </div>
          <Separator />
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['ledMirror', 'exhaustFan', 'waterHeater'].map((fixtureKey) => (
                <div key={fixtureKey} className="flex items-center justify-between space-x-2">
                  <div className="flex items-center">
                    <div className="mr-2 text-muted-foreground">
                      {fixtureKey === 'ledMirror' && <Lightbulb size={16} />}
                      {fixtureKey === 'exhaustFan' && <Fan size={16} />}
                      {fixtureKey === 'waterHeater' && <Thermometer size={16} />}
                    </div>
                    <Label htmlFor={`electrical-${fixtureKey}`} className="cursor-pointer">
                      {getFixtureName(electricalFixtures, fixtureKey)}
                    </Label>
                  </div>
                  <Switch
                    id={`electrical-${fixtureKey}`}
                    checked={state.fixtures.electrical[fixtureKey as keyof typeof state.fixtures.electrical]}
                    onCheckedChange={(checked) => handleFixtureChange('electrical', fixtureKey, checked)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Plumbing Options - Changed to RadioGroup */}
        <Card className="overflow-hidden">
          <div className="bg-secondary px-4 py-3 flex items-center">
            <div className="mr-2 text-primary"><ShowerHead className="h-5 w-5" /></div>
            <h3 className="font-medium">Plumbing Options</h3>
          </div>
          <Separator />
          <CardContent className="p-6">
            <RadioGroup 
              value={getSelectedPlumbingOption()} 
              onValueChange={handlePlumbingChange}
              className="space-y-4"
            >
              {['completePlumbing', 'fixtureInstallationOnly'].map((fixtureKey) => (
                <div key={fixtureKey} className="flex items-center space-x-2">
                  <RadioGroupItem value={fixtureKey} id={`plumbing-${fixtureKey}`} />
                  <Label htmlFor={`plumbing-${fixtureKey}`} className="cursor-pointer">
                    {getFixtureName(plumbingFixtures, fixtureKey)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
        
        {/* Additional Fixtures */}
        <Card className="overflow-hidden">
          <div className="bg-secondary px-4 py-3 flex items-center">
            <div className="mr-2 text-primary"><ShowerHead className="h-5 w-5" /></div>
            <h3 className="font-medium">Additional Fixtures</h3>
          </div>
          <Separator />
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['showerPartition', 'vanity', 'bathtub', 'jacuzzi'].map((fixtureKey) => (
                <div key={fixtureKey} className="flex items-center justify-between space-x-2">
                  <div className="flex items-center">
                    <div className="mr-2 text-muted-foreground">
                      {fixtureKey === 'showerPartition' && <ShowerHead size={16} />}
                      {fixtureKey === 'vanity' && <Palette size={16} />}
                      {fixtureKey === 'bathtub' && <Bath size={16} />}
                      {fixtureKey === 'jacuzzi' && <Waves size={16} />}
                    </div>
                    <Label htmlFor={`additional-${fixtureKey}`} className="cursor-pointer">
                      {getFixtureName(additionalFixtures, fixtureKey)}
                    </Label>
                  </div>
                  <Switch
                    id={`additional-${fixtureKey}`}
                    checked={state.fixtures.additional[fixtureKey as keyof typeof state.fixtures.additional]}
                    onCheckedChange={(checked) => handleFixtureChange('additional', fixtureKey, checked)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
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
