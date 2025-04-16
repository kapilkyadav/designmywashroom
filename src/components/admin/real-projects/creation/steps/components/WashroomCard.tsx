
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Trash } from 'lucide-react';
import { WashroomWithAreas } from '../../types';

interface WashroomCardProps {
  washroom: WashroomWithAreas;
  index: number;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof WashroomWithAreas, value: any) => void;
  canRemove: boolean;
}

const WashroomCard: React.FC<WashroomCardProps> = ({ 
  washroom, 
  index, 
  onRemove, 
  onChange,
  canRemove
}) => {
  return (
    <Card className="relative">
      <CardContent className="pt-6">
        <div className="absolute top-2 right-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onRemove(index)}
            disabled={!canRemove}
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
              onChange={(e) => onChange(index, 'name', e.target.value)}
              placeholder="E.g., Master Washroom, Powder Room, etc."
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor={`length-${index}`}>Length (feet)*</Label>
            <Input
              id={`length-${index}`}
              type="number"
              step="0.01"
              min="0"
              value={washroom.length || ''}
              onChange={(e) => onChange(index, 'length', e.target.value)}
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
              onChange={(e) => onChange(index, 'width', e.target.value)}
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
              onChange={(e) => onChange(index, 'height', e.target.value)}
            />
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Floor Area</Label>
            <Input
              value={`${(washroom.length * washroom.width).toFixed(2)} sq ft`}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div>
            <Label>Wall Area</Label>
            <Input
              value={`${washroom.wall_area?.toFixed(2) || '0.00'} sq ft`}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div>
            <Label>Total Area (Floor + Wall)</Label>
            <Input
              value={`${((washroom.length * washroom.width) + (washroom.wall_area || 0)).toFixed(2)} sq ft`}
              disabled
              className="bg-muted font-medium"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WashroomCard;
