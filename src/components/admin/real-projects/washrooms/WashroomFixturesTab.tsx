
import React from 'react';
import { RealProject } from '@/services/real-projects';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { FixtureService } from '@/services/FixtureService';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { WashroomService } from '@/services/real-projects/WashroomService';

interface WashroomFixturesTabProps {
  project: RealProject;
  onUpdate: () => void;
}

const WashroomFixturesTab: React.FC<WashroomFixturesTabProps> = ({ project, onUpdate }) => {
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

  const updateWashroomFixture = async (washroomId: string, fixtureId: string, checked: boolean) => {
    try {
      const updatedWashroom = project.washrooms?.find(w => w.id === washroomId);
      if (!updatedWashroom) return;

      if (!updatedWashroom.fixtures) {
        updatedWashroom.fixtures = {};
      }
      updatedWashroom.fixtures[fixtureId] = checked;

      const success = await WashroomService.updateWashroom(project.id, updatedWashroom);
      
      if (success) {
        onUpdate();
      } else {
        throw new Error("Failed to update washroom");
      }
    } catch (error) {
      console.error('Error saving fixture selection:', error);
      toast({
        title: "Error",
        description: "Failed to save fixture selection. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!project.washrooms?.length) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            No washrooms found. Please add washrooms first.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {project.washrooms.map(washroom => (
        <Card key={washroom.id}>
          <CardHeader>
            <CardTitle>{washroom.name}</CardTitle>
            <CardDescription>
              {washroom.length}ft × {washroom.width}ft
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(fixturesByCategory).map(([category, fixtures]) => (
              <div key={category} className="mb-6">
                <h3 className="font-medium mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fixtures.map(fixture => (
                    <div key={fixture.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-accent">
                      <Checkbox
                        id={`fixture-${washroom.id}-${fixture.id}`}
                        checked={washroom.fixtures?.[fixture.id] || false}
                        onCheckedChange={(checked) => 
                          updateWashroomFixture(washroom.id, fixture.id, !!checked)
                        }
                      />
                      <div className="flex flex-col">
                        <Label htmlFor={`fixture-${washroom.id}-${fixture.id}`} className="font-medium">
                          {fixture.name}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          Client Price: ₹{fixture.client_price || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WashroomFixturesTab;
