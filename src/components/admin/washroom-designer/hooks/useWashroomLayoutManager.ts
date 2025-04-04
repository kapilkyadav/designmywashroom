
import { useState, useCallback, useRef } from 'react';
import Konva from 'konva';

export interface WashroomFixture {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WashroomDimensions {
  length: number;
  width: number;
  height: number;
}

export const useWashroomLayoutManager = (dimensions: WashroomDimensions) => {
  const [fixtures, setFixtures] = useState<WashroomFixture[]>([]);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  
  // Add a new fixture
  const addFixture = useCallback((fixtureData: Omit<WashroomFixture, 'id' | 'x' | 'y'>) => {
    const id = `fixture-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Place it in the center of the visible area initially
    const x = (dimensions.length * 50) / 2 - fixtureData.width / 2;
    const y = (dimensions.width * 50) / 2 - fixtureData.height / 2;
    
    const newFixture: WashroomFixture = {
      ...fixtureData,
      id,
      x,
      y,
    };
    
    setFixtures(prev => [...prev, newFixture]);
    setSelectedFixtureId(id);
    
    return id;
  }, [dimensions]);
  
  // Remove a fixture
  const removeFixture = useCallback((id: string) => {
    setFixtures(prev => prev.filter(fixture => fixture.id !== id));
    
    if (selectedFixtureId === id) {
      setSelectedFixtureId(null);
    }
  }, [selectedFixtureId]);
  
  // Update fixture position
  const updateFixturePosition = useCallback((id: string, x: number, y: number) => {
    setFixtures(prev => 
      prev.map(fixture => 
        fixture.id === id 
          ? { ...fixture, x, y } 
          : fixture
      )
    );
  }, []);
  
  // Select a fixture
  const selectFixture = useCallback((id: string) => {
    setSelectedFixtureId(id);
  }, []);
  
  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.1, 2.0));
  }, []);
  
  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  }, []);
  
  // Reset layout
  const resetLayout = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the layout? This will remove all fixtures.')) {
      setFixtures([]);
      setSelectedFixtureId(null);
      setScale(1);
    }
  }, []);
  
  // Export to image
  const exportToImage = useCallback(() => {
    const stage = Konva.stages[0];
    
    if (stage) {
      const dataURL = stage.toDataURL({
        pixelRatio: 2
      });
      
      // Create a download link
      const link = document.createElement('a');
      link.download = `washroom-layout-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);
  
  return {
    fixtures,
    selectedFixtureId,
    scale,
    addFixture,
    removeFixture,
    updateFixturePosition,
    selectFixture,
    zoomIn,
    zoomOut,
    resetLayout,
    exportToImage
  };
};
