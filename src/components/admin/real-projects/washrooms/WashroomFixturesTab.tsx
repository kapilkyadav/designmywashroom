
import React, { useState } from 'react';
import { RealProject } from '@/services/real-projects';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LoadingState, ErrorState } from '@/components/admin/real-projects/ProjectDetailStates';
import { useQuery } from '@tanstack/react-query';
import { fixtureService } from '@/services/fixtures/FixtureService';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { WashroomService } from '@/services/real-projects/WashroomService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface WashroomFixturesTabProps {
  project: RealProject;
  onUpdate: () => void;
}

const WashroomFixturesTab: React.FC<WashroomFixturesTabProps> = ({ project, onUpdate }) => {
  const [activeWashroom, setActiveWashroom] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: fixtures = [], isLoading: isFixturesLoading } = useQuery({
    queryKey: ['fixtures'],
    queryFn: () => fixtureService.getAllFixtures(),
  });

  const fixturesByCategory = fixtures.reduce((acc, fixture) => {
    const category = fixture.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(fixture);
    return acc;
  }, {} as Record<string, any[]>);

  if (isFixturesLoading) {
    return <LoadingState />;
  }

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

  const updateWashroomFixture = async (washroomId: string, fixtureId: string, checked: boolean) => {
    try {
      setIsLoading(true);
      const updatedWashroom = project.washrooms?.find(w => w.id === washroomId);
      if (!updatedWashroom) return;

      const washroomToUpdate = {
        ...updatedWashroom,
        fixtures: {
          ...(updatedWashroom.fixtures || {}),
          [fixtureId]: checked
        }
      };

      const success = await WashroomService.updateWashroom(project.id, washroomToUpdate);
      
      if (success) {
        onUpdate();
        toast({
          title: "Success",
          description: "Fixture updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating fixture:', error);
      toast({
        title: "Error",
        description: "Failed to update fixture",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={project.washrooms[0].id} onValueChange={setActiveWashroom}>
        <TabsList className="w-full h-auto flex-wrap">
          {project.washrooms.map(washroom => (
            <TabsTrigger key={washroom.id} value={washroom.id} className="flex-grow">
              <div className="flex flex-col items-start">
                <span>{washroom.name}</span>
                <span className="text-xs text-muted-foreground">
                  {washroom.length}' × {washroom.width}'
                </span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {project.washrooms.map(washroom => (
          <TabsContent key={washroom.id} value={washroom.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{washroom.name} Fixtures</span>
                  <Badge variant="outline">
                    {Object.values(washroom.fixtures || {}).filter(Boolean).length} Selected
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Select fixtures for {washroom.name} ({washroom.length}' × {washroom.width}')
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[60vh] pr-4">
                  {Object.entries(fixturesByCategory).map(([category, categoryFixtures]) => (
                    <div key={category} className="mb-6">
                      <h3 className="font-medium mb-3">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryFixtures.map(fixture => (
                          <div key={fixture.id} className="flex items-start gap-4 p-3 rounded-lg border">
                            <Checkbox
                              id={`fixture-${washroom.id}-${fixture.id}`}
                              checked={washroom.fixtures?.[fixture.id] || false}
                              onCheckedChange={(checked) => 
                                updateWashroomFixture(washroom.id, fixture.id, !!checked)
                              }
                              disabled={isLoading}
                            />
                            <div className="flex flex-col">
                              <Label 
                                htmlFor={`fixture-${washroom.id}-${fixture.id}`} 
                                className="font-medium cursor-pointer"
                              >
                                {fixture.name}
                              </Label>
                              <span className="text-sm text-muted-foreground">
                                ₹{fixture.client_price || 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-6" />
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default WashroomFixturesTab;
