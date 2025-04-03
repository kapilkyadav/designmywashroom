
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash, Plus, ArrowRight } from 'lucide-react';
import { WashroomWithAreas } from '../ProjectCreateWizard';
import { Badge } from '@/components/ui/badge';

interface WashroomsStepProps {
  initialWashrooms: WashroomWithAreas[];
  onSubmit: (washrooms: WashroomWithAreas[]) => void;
}

const WashroomsStep: React.FC<WashroomsStepProps> = ({ initialWashrooms, onSubmit }) => {
  const [washrooms, setWashrooms] = useState<WashroomWithAreas[]>(
    initialWashrooms.length > 0 
      ? initialWashrooms 
      : [createDefaultWashroom()]
  );
  
  function createDefaultWashroom(): WashroomWithAreas {
    return {
      name: "Washroom " + (washrooms?.length + 1 || 1),
      length: 0,
      width: 0,
      height: 8,
      floorArea: 0,
      wallArea: 0,
      ceilingArea: 0,
      services: {}
    };
  }
  
  // Calculate areas whenever dimensions change
  useEffect(() => {
    const updatedWashrooms = washrooms.map(washroom => {
      const floorArea = washroom.length * washroom.width;
      const wallArea = 2 * washroom.height * (washroom.length + washroom.width);
      const ceilingArea = washroom.length * washroom.width;
      
      return {
        ...washroom,
        floorArea,
        wallArea,
        ceilingArea
      };
    });
    
    if (JSON.stringify(updatedWashrooms) !== JSON.stringify(washrooms)) {
      setWashrooms(updatedWashrooms);
    }
  }, [washrooms]);
  
  const handleAddWashroom = () => {
    setWashrooms([...washrooms, createDefaultWashroom()]);
  };
  
  const handleRemoveWashroom = (index: number) => {
    if (washrooms.length === 1) {
      alert("You must have at least one washroom.");
      return;
    }
    
    const updatedWashrooms = [...washrooms];
    updatedWashrooms.splice(index, 1);
    setWashrooms(updatedWashrooms);
  };
  
  const handleInputChange = (index: number, field: keyof WashroomWithAreas, value: any) => {
    const updatedWashrooms = [...washrooms];
    const washroom = { ...updatedWashrooms[index] };
    
    if (field === 'length' || field === 'width' || field === 'height') {
      washroom[field] = parseFloat(value) || 0;
    } else {
      // @ts-ignore
      washroom[field] = value;
    }
    
    updatedWashrooms[index] = washroom;
    setWashrooms(updatedWashrooms);
  };
  
  const handleSubmit = () => {
    // Validation: check if washrooms have dimensions and names
    const isValid = washrooms.every(washroom => 
      washroom.name.trim() !== '' && 
      washroom.length > 0 && 
      washroom.width > 0 && 
      washroom.height > 0
    );
    
    if (!isValid) {
      alert("Please ensure all washrooms have a name and valid dimensions (greater than 0).");
      return;
    }
    
    onSubmit(washrooms);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Washrooms Information</h3>
        <Badge variant="outline">{washrooms.length} washroom(s)</Badge>
      </div>
      
      <div className="space-y-4">
        {washrooms.map((washroom, index) => (
          <Card key={index} className="relative">
            <CardContent className="pt-6">
              <div className="absolute top-2 right-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveWashroom(index)}
                  disabled={washrooms.length === 1}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor={`washroom-name-${index}`}>Washroom Name*</Label>
                  <Input
                    id={`washroom-name-${index}`}
                    value={washroom.name}
                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    placeholder="E.g., Master Washroom, Powder Room, etc."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div>
                  <Label htmlFor={`length-${index}`}>Length (feet)*</Label>
                  <Input
                    id={`length-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={washroom.length || ''}
                    onChange={(e) => handleInputChange(index, 'length', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`width-${index}`}>Width (feet)*</Label>
                  <Input
                    id={`width-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={washroom.width || ''}
                    onChange={(e) => handleInputChange(index, 'width', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`height-${index}`}>Height (feet)*</Label>
                  <Input
                    id={`height-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={washroom.height || ''}
                    onChange={(e) => handleInputChange(index, 'height', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 bg-muted/40 p-3 rounded-md">
                <div>
                  <Label className="text-xs text-muted-foreground">Floor Area</Label>
                  <p className="font-medium">{washroom.floorArea.toFixed(2)} sq. ft.</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Wall Area</Label>
                  <p className="font-medium">{washroom.wallArea.toFixed(2)} sq. ft.</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Ceiling Area</Label>
                  <p className="font-medium">{washroom.ceilingArea.toFixed(2)} sq. ft.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button
          variant="outline"
          onClick={handleAddWashroom}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Washroom
        </Button>
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button onClick={handleSubmit}>
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WashroomsStep;
