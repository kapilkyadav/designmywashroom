
import { WashroomWithAreas } from '../types';

export const createDefaultWashroom = (count: number = 1): WashroomWithAreas => {
  return {
    name: "Washroom " + count,
    length: 0,
    width: 0,
    height: 8,
    floorArea: 0,
    wall_area: 0,  // Changed from wallArea
    ceilingArea: 0,
    services: {}
  };
};

export const calculateWashroomAreas = (washroom: WashroomWithAreas): WashroomWithAreas => {
  const floorArea = washroom.length * washroom.width;
  const wall_area = 2 * washroom.height * (washroom.length + washroom.width);  // Changed from wallArea
  const ceilingArea = washroom.length * washroom.width;
  
  return {
    ...washroom,
    floorArea,
    wall_area,  // Changed from wallArea
    ceilingArea
  };
};

export const recalculateAllWashroomAreas = (washrooms: WashroomWithAreas[]): WashroomWithAreas[] => {
  return washrooms.map(calculateWashroomAreas);
};
