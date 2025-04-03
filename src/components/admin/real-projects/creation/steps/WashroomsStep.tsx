
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRight } from 'lucide-react';
import { WashroomWithAreas } from '../types';
import { useWashroomManager } from './hooks/useWashroomManager';
import WashroomCard from './components/WashroomCard';

interface WashroomsStepProps {
  initialWashrooms: WashroomWithAreas[];
  onSubmit: (washrooms: WashroomWithAreas[]) => void;
}

const WashroomsStep: React.FC<WashroomsStepProps> = ({ initialWashrooms, onSubmit }) => {
  const { 
    washrooms, 
    handleAddWashroom, 
    handleRemoveWashroom, 
    handleInputChange, 
    validateWashrooms 
  } = useWashroomManager(initialWashrooms);
  
  const handleSubmit = () => {
    if (!validateWashrooms()) {
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
          <WashroomCard
            key={index}
            washroom={washroom}
            index={index}
            onRemove={handleRemoveWashroom}
            onChange={handleInputChange}
            canRemove={washrooms.length > 1}
          />
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
