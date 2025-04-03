
import { WashroomWithAreas } from '../ProjectCreateWizard';

/**
 * Creates a default washroom with specified count for naming
 */
export const createDefaultWashroom = (count: number = 1): WashroomWithAreas => {
  return {
    name: "Washroom " + count,
    length: 0,
    width: 0,
    height: 8,
    floorArea: 0,
    wallArea: 0,
    ceilingArea: 0,
    services: {}
  };
};

/**
 * Calculates areas for a washroom based on its dimensions
 */
export const calculateWashroomAreas = (washroom: WashroomWithAreas): WashroomWithAreas => {
  const floorArea = washroom.length * washroom.width;
  const wallArea = 2 * washroom.height * (washroom.length + washroom.width);
  const ceilingArea = washroom.length * washroom.width;
  
  return {
    ...washroom,
    floorArea,
    wallArea,
    ceilingArea
  };
};

/**
 * Recalculates areas for all washrooms
 */
export const recalculateAllWashroomAreas = (washrooms: WashroomWithAreas[]): WashroomWithAreas[] => {
  return washrooms.map(calculateWashroomAreas);
};
