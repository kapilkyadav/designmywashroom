
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WashroomFixture } from './hooks/useWashroomLayoutManager';

interface FixtureLibraryProps {
  onSelectFixture: (fixture: Omit<WashroomFixture, 'id' | 'x' | 'y'>) => void;
}

export const FixtureLibrary: React.FC<FixtureLibraryProps> = ({ onSelectFixture }) => {
  const fixtures = {
    'Toilets': [
      { name: 'Standard Toilet', category: 'Toilets', price: 15000 },
      { name: 'Premium Toilet', category: 'Toilets', price: 25000 },
    ],
    'Sinks': [
      { name: 'Basic Sink', category: 'Sinks', price: 8000 },
      { name: 'Deluxe Sink', category: 'Sinks', price: 12000 },
    ],
    'Accessories': [
      { name: 'Soap Dispenser', category: 'Accessories', price: 1500 },
      { name: 'Paper Towel Holder', category: 'Accessories', price: 2000 },
    ]
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs defaultValue="Toilets">
          <TabsList>
            {Object.keys(fixtures).map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(fixtures).map(([category, items]) => (
            <TabsContent key={category} value={category}>
              <ScrollArea className="h-[200px]">
                <div className="grid grid-cols-2 gap-2">
                  {items.map((fixture) => (
                    <button
                      key={fixture.name}
                      className="p-2 text-left border rounded hover:bg-accent"
                      onClick={() => onSelectFixture(fixture)}
                    >
                      <div>{fixture.name}</div>
                      <div className="text-sm text-muted-foreground">₹{fixture.price}</div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FixtureLibrary;
