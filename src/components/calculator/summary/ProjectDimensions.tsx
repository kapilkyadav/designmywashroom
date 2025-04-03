
import React from 'react';

interface ProjectDimensionsProps {
  length: number;
  width: number;
  floorArea: number;
  wallArea: number;
}

const ProjectDimensions: React.FC<ProjectDimensionsProps> = ({ 
  length, 
  width, 
  floorArea, 
  wallArea 
}) => {
  return (
    <div>
      <h5 className="text-sm font-medium text-muted-foreground mb-2">Washroom Dimensions</h5>
      <p className="text-base">
        {length} × {width} × 8 feet
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Floor Area: {floorArea.toFixed(2)} sq ft
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Wall Area: {wallArea.toFixed(2)} sq ft
      </p>
    </div>
  );
};

export default ProjectDimensions;
