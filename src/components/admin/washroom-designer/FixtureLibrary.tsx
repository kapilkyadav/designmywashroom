
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WashroomFixture } from './hooks/useWashroomLayoutManager';
import { fixtureService } from '@/services/fixtures/FixtureService';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FixtureLibraryProps {
  onSelectFixture: (fixture: Omit<WashroomFixture, 'id' | 'x' | 'y'>) => void;
}

export const FixtureLibrary: React.FC<FixtureLibraryProps> = ({ onSelectFixture }) => {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFixtures = async () => {
      try {
        const data = await fixtureService.getAllFixtures();
        setFixtures(data);
      } catch (error) {
        console.error('Error loading fixtures:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFixtures();
  }, []);

  const fixturesByCategory = fixtures.reduce((acc, fixture) => {
    const category = fixture.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(fixture);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return <div>Loading fixtures...</div>;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs defaultValue={Object.keys(fixturesByCategory)[0] || 'Other'}>
          <TabsList className="mb-4">
            {Object.keys(fixturesByCategory).map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(fixturesByCategory).map(([category, categoryFixtures]) => (
            <TabsContent key={category} value={category}>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="grid grid-cols-2 gap-4">
                  {categoryFixtures.map((fixture) => (
                    <Button
                      key={fixture.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => onSelectFixture({
                        name: fixture.name,
                        width: fixture.width || 100,
                        height: fixture.height || 100,
                      })}
                    >
                      {fixture.name}
                    </Button>
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
