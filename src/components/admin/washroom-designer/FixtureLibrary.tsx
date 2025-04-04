
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { WashroomFixture } from './hooks/useWashroomLayoutManager';

interface FixtureCategory {
  name: string;
  fixtures: Array<{
    name: string;
    width: number;
    height: number;
    description?: string;
  }>;
}

const FIXTURE_CATEGORIES: FixtureCategory[] = [
  {
    name: 'Sanitary',
    fixtures: [
      { name: 'Toilet', width: 35, height: 70, description: 'Standard toilet fixture' },
      { name: 'Wall Toilet', width: 35, height: 55, description: 'Wall-mounted toilet' },
      { name: 'Urinal', width: 35, height: 40, description: 'Standard urinal fixture' },
    ]
  },
  {
    name: 'Sinks',
    fixtures: [
      { name: 'Basin', width: 60, height: 45, description: 'Standard wash basin' },
      { name: 'Vanity Sink', width: 80, height: 50, description: 'Sink with vanity cabinet' },
      { name: 'Double Sink', width: 120, height: 50, description: 'Double basin sink unit' },
    ]
  },
  {
    name: 'Shower & Bath',
    fixtures: [
      { name: 'Shower', width: 90, height: 90, description: 'Standard shower stall' },
      { name: 'Bathtub', width: 170, height: 70, description: 'Standard bathtub' },
      { name: 'Corner Bath', width: 120, height: 120, description: 'Corner bathtub unit' },
    ]
  },
  {
    name: 'Storage',
    fixtures: [
      { name: 'Cabinet', width: 50, height: 40, description: 'Storage cabinet' },
      { name: 'Tall Cabinet', width: 40, height: 60, description: 'Tall storage unit' },
    ]
  },
  {
    name: 'Openings',
    fixtures: [
      { name: 'Door', width: 80, height: 10, description: 'Standard door' },
      { name: 'Window', width: 80, height: 15, description: 'Standard window' },
    ]
  },
];

interface FixtureLibraryProps {
  onSelectFixture: (fixture: Omit<WashroomFixture, 'id' | 'x' | 'y'>) => void;
}

const FixtureLibrary: React.FC<FixtureLibraryProps> = ({ onSelectFixture }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = searchTerm 
    ? FIXTURE_CATEGORIES.map(category => ({
        ...category,
        fixtures: category.fixtures.filter(fixture => 
          fixture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fixture.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.fixtures.length > 0)
    : FIXTURE_CATEGORIES;

  const handleFixtureSelect = (fixture: { name: string; width: number; height: number }) => {
    onSelectFixture({
      name: fixture.name,
      width: fixture.width,
      height: fixture.height,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixture Library</CardTitle>
        <CardDescription>
          Choose fixtures to add to your washroom layout
        </CardDescription>
        <Input
          placeholder="Search fixtures..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={FIXTURE_CATEGORIES[0].name}>
          <TabsList className="flex flex-wrap">
            {filteredCategories.map(category => (
              <TabsTrigger key={category.name} value={category.name}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {filteredCategories.map(category => (
            <TabsContent key={category.name} value={category.name}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {category.fixtures.map((fixture, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{fixture.name}</CardTitle>
                      <CardDescription>
                        {fixture.width / 50}ft x {fixture.height / 50}ft
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="border rounded-md p-4 mb-3 bg-secondary/30">
                        <div 
                          className="bg-gray-300 dark:bg-gray-700 rounded" 
                          style={{ 
                            width: `${Math.min(100, fixture.width)}px`, 
                            height: `${Math.min(100, fixture.height)}px`,
                            margin: 'auto'
                          }}
                        />
                      </div>
                      {fixture.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {fixture.description}
                        </p>
                      )}
                      <Button 
                        variant="secondary" 
                        className="w-full"
                        onClick={() => handleFixtureSelect(fixture)}
                      >
                        Add to Layout
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No fixtures found matching "{searchTerm}"
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FixtureLibrary;
