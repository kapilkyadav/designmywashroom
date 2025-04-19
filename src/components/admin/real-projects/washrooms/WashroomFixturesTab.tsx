
import React, { useState, useEffect } from 'react';
import { RealProject } from '@/services/real-projects/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { FixtureService } from '@/services/fixtures/FixtureService';
import { WashroomService } from '@/services/real-projects/WashroomService';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface WashroomFixturesTabProps {
  project: RealProject;
  onUpdate: () => void;
}

const WashroomFixturesTab: React.FC<WashroomFixturesTabProps> = ({ project, onUpdate }) => {
  const [activeWashroom, setActiveWashroom] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: fixtures = [] } = useQuery({
    queryKey: ['fixtures'],
    queryFn: () => FixtureService.getAllFixtures(),
  });

  const fixturesByCategory = fixtures.reduce((acc, fixture) => {
    const category = fixture.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(fixture);
    return acc;
  }, {} as Record<string, any[]>);

  useEffect(() => {
    if (project.washrooms && project.washrooms.length > 0) {
      setActiveWashroom(project.washrooms[0].id);
    }
  }, [project.washrooms]);

  const handleFixtureSelect = async (washroomId: string, fixtureId: string, checked: boolean) => {
    const washroom = project.washrooms?.find(w => w.id === washroomId);
    if (!washroom) return;

    try {
      const updatedWashroom = {
        ...washroom,
        fixtures: {
          ...(washroom.fixtures || {}),
          [fixtureId]: checked
        }
      };

      const success = await WashroomService.updateWashroom(project.id, updatedWashroom);
      
      if (success) {
        onUpdate();
      } else {
        throw new Error("Failed to update fixtures");
      }
    } catch (error) {
      console.error('Error updating fixtures:', error);
      toast({
        title: "Error",
        description: "Failed to update fixtures. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!project.washrooms || project.washrooms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No washrooms found. Please add washrooms first.
      </div>
    );
  }

  return (
    <Tabs value={activeWashroom || ''} onValueChange={setActiveWashroom}>
      <TabsList className="mb-4">
        {project.washrooms.map(washroom => (
          <TabsTrigger key={washroom.id} value={washroom.id}>
            {washroom.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {project.washrooms.map(washroom => (
        <TabsContent key={washroom.id} value={washroom.id}>
          <div className="space-y-6">
            {Object.entries(fixturesByCategory).map(([category, categoryFixtures]) => (
              <Card key={category}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryFixtures.map(fixture => (
                      <div key={fixture.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent">
                        <Checkbox
                          id={`fixture-${washroom.id}-${fixture.id}`}
                          checked={washroom.fixtures?.[fixture.id] || false}
                          onCheckedChange={(checked) => handleFixtureSelect(washroom.id, fixture.id, !!checked)}
                        />
                        <div className="flex flex-col">
                          <Label htmlFor={`fixture-${washroom.id}-${fixture.id}`}>
                            {fixture.name}
                          </Label>
                          <span className="text-sm text-muted-foreground">
                            MRP: ₹{fixture.mrp || 'N/A'} | Client Price: ₹{fixture.client_price || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default WashroomFixturesTab;
