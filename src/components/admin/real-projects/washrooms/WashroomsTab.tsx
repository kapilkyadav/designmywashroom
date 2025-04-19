import React, { useState, useEffect } from 'react';
import { RealProject, Washroom, ServiceDetail } from '@/services/real-projects';
import { RealProjectService } from '@/services/real-projects';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { VendorRateCardService } from '@/services/VendorRateCardService';
import { BrandService } from '@/services/BrandService';
import { FixtureService } from '@/services/FixtureService';
import { WashroomService } from '@/services/real-projects/WashroomService'; // Import WashroomService


interface WashroomsTabProps {
  project: RealProject;
  services: any[];
  onUpdate: () => void;
}

const WashroomsTab: React.FC<WashroomsTabProps> = ({ project, services, onUpdate }) => {
  const [washrooms, setWashrooms] = useState<Washroom[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);

  const { data: brandsData = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => BrandService.getAllBrands(),
  });

  useEffect(() => {
    if (brandsData.length > 0) {
      setBrands(brandsData);
    }
  }, [brandsData]);

  const { data: vendorItems = [] } = useQuery({
    queryKey: ['vendor-items'],
    queryFn: () => VendorRateCardService.getItems(),
  });

  const servicesByCategory: Record<string, any[]> = {};
  vendorItems.forEach(service => {
    const category = service.category?.name || "Uncategorized";
    if (!servicesByCategory[category]) {
      servicesByCategory[category] = [];
    }
    servicesByCategory[category].push(service);
  });

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
      const updatedWashrooms = project.washrooms.map(washroom => {
        const calculatedWashroom = calculateWashroomAreas({
          ...washroom,
          selected_brand: washroom.selected_brand || project.selected_brand || ''
        });
        return calculatedWashroom;
      });
      setWashrooms(updatedWashrooms);
    } else {
      const defaultWashroom: Washroom = {
        id: `temp-${Date.now()}`,
        name: "Washroom 1",
        length: project.length || 0,
        width: project.width || 0,
        height: project.height || 9,
        area: (project.length || 0) * (project.width || 0),
        wall_area: calculateWallArea(project.length || 0, project.width || 0, project.height || 9),
        ceiling_area: (project.length || 0) * (project.width || 0),
        selected_brand: project.selected_brand || '',
        services: {},
        service_details: {},
        fixtures: {} // Initialize fixtures
      };
      setWashrooms([defaultWashroom]);
    }
  }, [project]);

  const calculateWallArea = (length: number, width: number, height: number): number => {
    const perimeter = 2 * (Number(length) + Number(width));
    return perimeter * Number(height);
  };

  const calculateWashroomAreas = (washroom: Washroom): Washroom => {
    const floorArea = Number(washroom.length) * Number(washroom.width);

    let wallArea = washroom.wall_area || 0;
    if (washroom.length > 0 && washroom.width > 0 && washroom.height > 0) {
      wallArea = calculateWallArea(washroom.length, washroom.width, washroom.height);
    }

    const ceilingArea = washroom.ceiling_area || floorArea;

    return {
      ...washroom,
      area: floorArea,
      wall_area: wallArea,
      ceiling_area: ceilingArea,
      total_area: floorArea + wallArea
    };
  };

  const addWashroom = () => {
    const newWashroom: Washroom = {
      id: `temp-${Date.now()}`,
      name: `Washroom ${washrooms.length + 1}`,
      length: 0,
      width: 0,
      height: 9,
      area: 0,
      wall_area: 0,
      ceiling_area: 0,
      selected_brand: project.selected_brand || '',
      services: {},
      service_details: {},
      fixtures: {} // Initialize fixtures
    };

    setWashrooms([...washrooms, newWashroom]);
  };

  const removeWashroom = (index: number) => {
    if (washrooms.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "At least one washroom is required for the project.",
        variant: "destructive",
      });
      return;
    }

    const updatedWashrooms = [...washrooms];
    updatedWashrooms.splice(index, 1);

    updatedWashrooms.forEach((washroom, idx) => {
      if (washroom.name.startsWith("Washroom ")) {
        washroom.name = `Washroom ${idx + 1}`;
      }
    });

    setWashrooms(updatedWashrooms);
  };

  const updateWashroomField = (index: number, field: keyof Washroom, value: any) => {
    const updatedWashrooms = [...washrooms];
    (updatedWashrooms[index] as Record<string, any>)[field] = value;

    if (field === 'length' || field === 'width' || field === 'height') {
      updatedWashrooms[index] = calculateWashroomAreas(updatedWashrooms[index]);
    }

    setWashrooms(updatedWashrooms);
  };

  const updateWashroomService = (index: number, serviceKey: string, checked: boolean) => {
    const updatedWashrooms = [...washrooms];
    if (!updatedWashrooms[index].services) {
      updatedWashrooms[index].services = {};
    }

    updatedWashrooms[index].services![serviceKey] = checked;

    if (checked) {
      if (!updatedWashrooms[index].service_details) {
        updatedWashrooms[index].service_details = {};
      }

      if (!updatedWashrooms[index].service_details![serviceKey]) {
        updatedWashrooms[index].service_details![serviceKey] = {
          quantity: 1,
          area: 0
        };
      }
    }

    setWashrooms(updatedWashrooms);
  };

  const updateServiceDetail = (washroomIndex: number, serviceId: string, field: keyof ServiceDetail, value: any) => {
    const updatedWashrooms = [...washrooms];

    if (!updatedWashrooms[washroomIndex].service_details) {
      updatedWashrooms[washroomIndex].service_details = {};
    }

    if (!updatedWashrooms[washroomIndex].service_details![serviceId]) {
      updatedWashrooms[washroomIndex].service_details![serviceId] = {};
    }

    (updatedWashrooms[washroomIndex].service_details![serviceId] as Record<string, any>)[field] = value;

    setWashrooms(updatedWashrooms);
  };

  const updateWashroomFixture = async (index: number, fixtureId: string, checked: boolean) => {
    const updatedWashrooms = [...washrooms];
    if (!updatedWashrooms[index].fixtures) {
      updatedWashrooms[index].fixtures = {};
    }
    updatedWashrooms[index].fixtures[fixtureId] = checked;
    setWashrooms(updatedWashrooms);

    // Save immediately to persist changes
    try {
      await WashroomService.updateWashroom(updatedWashrooms[index].id, {
        fixtures: updatedWashrooms[index].fixtures
      });
    } catch (error) {
      console.error('Error saving fixture selection:', error);
      toast({
        title: "Error",
        description: "Failed to save fixture selection",
        variant: "destructive"
      });
    }
  };

  const saveWashrooms = async () => {
    setIsUpdating(true);

    try {
      for (const washroom of washrooms) {
        if (!washroom.name || washroom.length <= 0 || washroom.width <= 0) {
          throw new Error("All washrooms must have a name and valid dimensions");
        }
      }

      const success = await RealProjectService.updateProjectWashrooms(project.id, washrooms);

      if (success) {
        toast({
          title: "Washrooms updated",
          description: "Washroom details have been saved successfully.",
        });

        onUpdate();
      }
    } catch (error: any) {
      toast({
        title: "Failed to save washrooms",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Project Washrooms</h3>
        <Button onClick={addWashroom}>
          <Plus className="mr-2 h-4 w-4" />
          Add Washroom
        </Button>
      </div>

      {washrooms.map((washroom, index) => (
        <Card key={washroom.id} className="overflow-hidden mb-6">
          <CardContent className="p-0">
            <div className="bg-secondary px-4 py-3 flex justify-between items-center">
              <h4 className="font-medium">{washroom.name}</h4>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeWashroom(index)}
                disabled={washrooms.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Separator />

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor={`washroom-name-${index}`}>Washroom Name</Label>
                  <Input
                    id={`washroom-name-${index}`}
                    value={washroom.name}
                    onChange={(e) => updateWashroomField(index, 'name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`washroom-brand-${index}`}>Preferred Brand</Label>
                  <Select
                    value={washroom.selected_brand || ''}
                    onValueChange={(value) => updateWashroomField(index, 'selected_brand', value)}
                  >
                    <SelectTrigger id={`washroom-brand-${index}`}>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`washroom-length-${index}`}>Length (ft)</Label>
                  <Input
                    id={`washroom-length-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={washroom.length}
                    onChange={(e) => updateWashroomField(index, 'length', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`washroom-width-${index}`}>Width (ft)</Label>
                  <Input
                    id={`washroom-width-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={washroom.width}
                    onChange={(e) => updateWashroomField(index, 'width', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`washroom-height-${index}`}>Height (ft)</Label>
                  <Input
                    id={`washroom-height-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={washroom.height}
                    onChange={(e) => updateWashroomField(index, 'height', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-4 bg-muted p-4 rounded-lg">
                      <div>
                        <Label>Floor Area</Label>
                        <div className="text-lg font-medium">
                          {(washroom.length * washroom.width).toFixed(2)} sq ft
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Length × Width
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 bg-muted p-4 rounded-lg">
                      <div>
                        <Label>Wall Area</Label>
                        <div className="text-lg font-medium">
                          {washroom.wall_area?.toFixed(2) || '0.00'} sq ft
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Perimeter × Height
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 bg-muted p-4 rounded-lg">
                      <div>
                        <Label>Ceiling Area</Label>
                        <div className="text-lg font-medium">
                          {washroom.ceiling_area?.toFixed(2) || '0.00'} sq ft
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 bg-muted p-4 rounded-lg">
                      <div>
                        <Label>Total Area</Label>
                        <div className="text-xl font-bold text-primary">
                          {washroom.total_area?.toFixed(2) || '0.00'} sq ft
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Floor Area + Wall Area
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {Object.keys(servicesByCategory).length > 0 && (
                <div className="mt-6">
                  <h5 className="font-medium mb-3">Execution Services</h5>
                  <div className="space-y-4">
                    {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                      <div key={category} className="border p-3 rounded-md">
                        <h6 className="font-medium mb-2">{category}</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryServices.map(service => (
                            <div key={service.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`service-${washroom.id}-${service.id}`}
                                checked={washroom.services?.[service.id] || false}
                                onCheckedChange={(checked) => 
                                  updateWashroomService(index, service.id, !!checked)
                                }
                              />
                              <Label htmlFor={`service-${washroom.id}-${service.id}`}>
                                {service.scope_of_work || service.name || "Unnamed Service"}
                                {service.measuring_unit && <span className="text-xs text-muted-foreground ml-1">({service.measuring_unit})</span>}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(fixturesByCategory).length > 0 && (
                <div className="mt-6">
                  <h5 className="font-medium mb-3">Fixtures</h5>
                  <div className="space-y-4">
                    {Object.entries(fixturesByCategory).map(([category, categoryFixtures]) => (
                      <div key={category} className="border p-3 rounded-md">
                        <h6 className="font-medium mb-2">{category}</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryFixtures.map(fixture => (
                            <div key={fixture.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`fixture-${washroom.id}-${fixture.id}`}
                                checked={washroom.fixtures?.[fixture.id] || false}
                                onCheckedChange={(checked) => 
                                  updateWashroomFixture(index, fixture.id, !!checked)
                                }
                              />
                              <Label htmlFor={`fixture-${washroom.id}-${fixture.id}`}>
                                {fixture.name}
                                {fixture.category && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({fixture.category})
                                  </span>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button 
          onClick={saveWashrooms}
          disabled={isUpdating}
        >
          {isUpdating && <Save className="mr-2 h-4 w-4 animate-spin" />}
          Save Washrooms
        </Button>
      </div>
    </div>
  );
};

export default WashroomsTab;