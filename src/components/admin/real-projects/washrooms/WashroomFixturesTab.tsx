
import React, { useState, useEffect } from 'react';
import { RealProject } from '@/services/real-projects/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { FixtureService } from '@/services/fixtures/FixtureService';
import { WashroomService } from '@/services/real-projects/WashroomService';
import { toast } from '@/hooks/use-toast';
import { Shower, Lightbulb, Fan, Thermometer } from 'lucide-react';

interface WashroomFixturesTabProps {
  project: RealProject;
  onUpdate: () => void;
}

const WashroomFixturesTab: React.FC<WashroomFixturesTabProps> = ({ project, onUpdate }) => {
  const [activeWashroom, setActiveWashroom] = useState<string | null>(null);

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
        },
        id: washroomId // Ensure ID is included
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'plumbing':
        return <Shower className="h-5 w-5" />;
      case 'electrical':
        return <Lightbulb className="h-5 w-5" />;
      case 'ventilation':
        return <Fan className="h-5 w-5" />;
      case 'heating':
        return <Thermometer className="h-5 w-5" />;
      default:
        return null;
    }
  };

  if (!project.washrooms || project.washrooms.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No washrooms found. Please add washrooms first.
      </div>
    );
  }

  const selectedWashroom = project.washrooms.find(w => w.id === activeWashroom);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Washroom Selection Sidebar */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Washrooms</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2">
              {project.washrooms.map(washroom => {
                const selectedFixturesCount = Object.values(washroom.fixtures || {}).filter(Boolean).length;
                return (
                  <button
                    key={washroom.id}
                    onClick={() => setActiveWashroom(washroom.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeWashroom === washroom.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{washroom.name}</div>
                    <div className="text-sm opacity-80">
                      {selectedFixturesCount} {selectedFixturesCount === 1 ? 'fixture' : 'fixtures'} selected
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Fixtures Selection Area */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Select Fixtures
            {selectedWashroom && (
              <Badge variant="outline">
                {selectedWashroom.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-6">
              {Object.entries(fixturesByCategory).map(([category, categoryFixtures]) => (
                <Card key={category} className="border-0 shadow-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <CardTitle className="text-base">{category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {categoryFixtures.map(fixture => {
                        const isSelected = selectedWashroom?.fixtures?.[fixture.id] || false;
                        return (
                          <div
                            key={fixture.id}
                            className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                              isSelected ? 'bg-primary/5' : 'hover:bg-accent'
                            }`}
                          >
                            <Checkbox
                              id={`fixture-${activeWashroom}-${fixture.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                activeWashroom &&
                                handleFixtureSelect(activeWashroom, fixture.id, !!checked)
                              }
                              disabled={!activeWashroom}
                            />
                            <div className="flex flex-col flex-1">
                              <Label
                                htmlFor={`fixture-${activeWashroom}-${fixture.id}`}
                                className="font-medium"
                              >
                                {fixture.name}
                              </Label>
                              <div className="text-sm text-muted-foreground">
                                MRP: ₹{fixture.mrp?.toLocaleString() || 'N/A'} | Client: ₹{fixture.client_price?.toLocaleString() || 'N/A'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default WashroomFixturesTab;
