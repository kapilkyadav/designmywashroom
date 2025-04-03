
import { useState, useEffect } from 'react';
import { WashroomWithAreas } from '../../ProjectCreateWizard';
import { createDefaultWashroom, recalculateAllWashroomAreas } from '../../utils/washroomUtils';

export function useWashroomManager(initialWashrooms: WashroomWithAreas[]) {
  const [washrooms, setWashrooms] = useState<WashroomWithAreas[]>(
    initialWashrooms.length > 0 
      ? initialWashrooms 
      : [createDefaultWashroom(1)]
  );

  // Calculate areas whenever dimensions change
  useEffect(() => {
    const updatedWashrooms = recalculateAllWashroomAreas(washrooms);
    
    if (JSON.stringify(updatedWashrooms) !== JSON.stringify(washrooms)) {
      setWashrooms(updatedWashrooms);
    }
  }, [washrooms]);
  
  const handleAddWashroom = () => {
    setWashrooms([...washrooms, createDefaultWashroom(washrooms.length + 1)]);
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
  
  const validateWashrooms = (): boolean => {
    // Validation: check if washrooms have dimensions and names
    return washrooms.every(washroom => 
      washroom.name.trim() !== '' && 
      washroom.length > 0 && 
      washroom.width > 0 && 
      washroom.height > 0
    );
  };

  return {
    washrooms,
    handleAddWashroom,
    handleRemoveWashroom,
    handleInputChange,
    validateWashrooms
  };
}
