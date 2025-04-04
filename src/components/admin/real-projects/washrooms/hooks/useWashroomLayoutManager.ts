
import { useRef, useState, useEffect } from 'react';
import { Stage } from 'react-konva';
import { Washroom } from '@/services/real-projects/types';

interface FixtureItem {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
}

export function useWashroomLayoutManager(washroom: Washroom) {
  const stageRef = useRef<Stage>(null);
  const [scale, setScale] = useState(1);
  const [layoutItems, setLayoutItems] = useState<FixtureItem[]>([]);
  
  // Initialize with any saved layout data
  useEffect(() => {
    if (washroom.service_details?.layout?.items) {
      try {
        const savedItems = washroom.service_details.layout.items;
        if (Array.isArray(savedItems)) {
          setLayoutItems(savedItems);
        }
      } catch (error) {
        console.error("Error loading saved layout:", error);
      }
    }
  }, [washroom]);
  
  // Add a fixture to the layout
  const addFixture = (fixture: FixtureItem) => {
    setLayoutItems(prev => [...prev, fixture]);
  };
  
  // Remove a fixture from the layout
  const removeFixture = (id: string) => {
    setLayoutItems(prev => prev.filter(item => item.id !== id));
  };
  
  // Save the current layout
  const saveLayout = () => {
    const layoutData = {
      washroomId: washroom.id,
      items: layoutItems,
      dimensions: {
        length: washroom.length,
        width: washroom.width,
        height: washroom.height
      },
      timestamp: new Date().toISOString()
    };
    
    return layoutData;
  };
  
  // Zoom in
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };
  
  // Zoom out
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  // Download the layout as an image
  const downloadImage = () => {
    if (!stageRef.current) return;
    
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = `${washroom.name.replace(/\s+/g, '_')}_layout.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return {
    layoutItems,
    addFixture,
    removeFixture,
    saveLayout,
    stageRef,
    scale,
    zoomIn,
    zoomOut,
    downloadImage
  };
}
