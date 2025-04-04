
import React, { useState, useEffect } from 'react';
import { RealProject, Washroom } from '@/services/RealProjectService';
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

interface WashroomsTabProps {
  project: RealProject;
  services: any[];
  onUpdate: () => void;
}

const WashroomsTab: React.FC<WashroomsTabProps> = ({ project, services, onUpdate }) => {
  const [washrooms, setWashrooms] = useState<Washroom[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [brands, setBrands] = useState<any[]>([]);

  // Fetch all brands
  const { data: brandsData = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => BrandService.getAllBrands(),
  });

  useEffect(() => {
    if (brandsData.length > 0) {
      setBrands(brandsData);
    }
  }, [brandsData]);

  // Fetch all vendor items to use for services
  const { data: vendorItems = [] } = useQuery({
    queryKey: ['vendor-items'],
    queryFn: () => VendorRateCardService.getItems(),
  });

  // Group vendor items by category
  const servicesByCategory: Record<string, any[]> = {};
  vendorItems.forEach(service => {
    const category = service.category?.name || "Uncategorized";
    if (!servicesByCategory[category]) {
      servicesByCategory[category] = [];
    }
    servicesByCategory[category].push(service);
  });
  
  useEffect(() => {
    // Initialize with project washrooms or create a default one
    if (project.washrooms && project.washrooms.length > 0) {
      // Make sure each washroom has a selected_brand field
      const updatedWashrooms = project.washrooms.map(washroom => ({
        ...washroom,
        selected_brand: washroom.selected_brand || project.selected_brand || ''
      }));
      setWashrooms(updatedWashrooms);
    } else {
      const defaultWashroom: Washroom = {
        id: `temp-${Date.now()}`,
        name: "Washroom 1",
        length: project.length || 0,
        width: project.width || 0,
        height: project.height || 9,
        area: (project.length || 0) * (project.width || 0),
        selected_brand: project.selected_brand || '',
        services: {},
        wall_area: 0,
        ceiling_area: 0,
        service_details: {}
      };
      setWashrooms([defaultWashroom]);
    }
  }, [project]);
  
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
      service_details: {}
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
    
    // Rename washrooms to maintain sequential numbering
    updatedWashrooms.forEach((washroom, idx) => {
      if (washroom.name.startsWith("Washroom ")) {
        washroom.name = `Washroom ${idx + 1}`;
      }
    });
    
    setWashrooms(updatedWashrooms);
  };
  
  const updateWashroomField = (index: number, field: keyof Washroom, value: any) => {
    const updatedWashrooms = [...washrooms];
    (updatedWashrooms[index][field] as any) = value;
    
    // Recalculate area if dimensions change
    if (field === 'length' || field === 'width') {
      updatedWashrooms[index].area = 
        Number(updatedWashrooms[index].length) * 
        Number(updatedWashrooms[index].width);
      
      // Update ceiling area to match floor area if not manually set
      if (!updatedWashrooms[index].ceiling_area || updatedWashrooms[index].ceiling_area === 0) {
        updatedWashrooms[index].ceiling_area = updatedWashrooms[index].area;
      }
      
      // Calculate wall area if dimensions are available
      if (updatedWashrooms[index].length > 0 && updatedWashrooms[index].width > 0 && updatedWashrooms[index].height > 0) {
        // Perimeter × height = wall area
        const perimeter = 2 * (Number(updatedWashrooms[index].length) + Number(updatedWashrooms[index].width));
        updatedWashrooms[index].wall_area = perimeter * Number(updatedWashrooms[index].height);
      }
    }
    
    // Update wall area if height changes
    if (field === 'height' && updatedWashrooms[index].length > 0 && updatedWashrooms[index].width > 0) {
      const perimeter = 2 * (Number(updatedWashrooms[index].length) + Number(updatedWashrooms[index].width));
      updatedWashrooms[index].wall_area = perimeter * Number(updatedWashrooms[index].height);
    }
    
    setWashrooms(updatedWashrooms);
  };
  
  const updateWashroomService = (index: number, serviceKey: string, checked: boolean) => {
    const updatedWashrooms = [...washrooms];
    if (!updatedWashrooms[index].services) {
      updatedWashrooms[index].services = {};
    }
    
    updatedWashrooms[index].services[serviceKey] = checked;
    
    // Initialize service_details for this service if it doesn't exist
    if (checked) {
      if (!updatedWashrooms[index].service_details) {
        updatedWashrooms[index].service_details = {};
      }
      
      if (!updatedWashrooms[index].service_details[serviceKey]) {
        updatedWashrooms[index].service_details[serviceKey] = {
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
    
    if (!updatedWashrooms[washroomIndex].service_details[serviceId]) {
      updatedWashrooms[washroomIndex].service_details[serviceId] = {};
    }
    
    updatedWashrooms[washroomIndex].service_details[serviceId][field] = value;
    
    setWashrooms(updatedWashrooms);
  };
  
  const saveWashrooms = async () => {
    setIsUpdating(true);
    
    try {
      // Validate washrooms
      for (const washroom of washrooms) {
        if (!washroom.name || washroom.length <= 0 || washroom.width <= 0) {
          throw new Error("All washrooms must have a name and valid dimensions");
        }
      }
      
      // Use the RealProjectService to update washrooms
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
                
                <div className="space-y-2">
                  <Label>Floor Area (sq ft)</Label>
                  <Input
                    value={washroom.area.toFixed(2)}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`washroom-wall-area-${index}`}>Wall Area (sq ft)</Label>
                  <Input
                    id={`washroom-wall-area-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={washroom.wall_area || 0}
                    onChange={(e) => updateWashroomField(index, 'wall_area', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated: perimeter × height
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`washroom-ceiling-area-${index}`}>Ceiling Area (sq ft)</Label>
                  <Input
                    id={`washroom-ceiling-area-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={washroom.ceiling_area || 0}
                    onChange={(e) => updateWashroomField(index, 'ceiling_area', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Default: same as floor area
                  </p>
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
