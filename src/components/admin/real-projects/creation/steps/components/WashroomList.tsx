
import React from 'react';
import { Ruler } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WashroomWithAreas } from '../../types';

interface WashroomListProps {
  washrooms: WashroomWithAreas[];
  serviceNames: Record<string, string>;
}

const WashroomList: React.FC<WashroomListProps> = ({ washrooms, serviceNames }) => {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <h4 className="text-sm font-semibold text-muted-foreground">Washrooms</h4>
        <Badge variant="secondary">{washrooms.length} washroom(s)</Badge>
      </div>
      
      <div className="space-y-4">
        {washrooms.map((washroom, index) => (
          <div key={index} className="border rounded-md p-3">
            <h5 className="font-semibold mb-2">{washroom.name}</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <span className="text-xs text-muted-foreground block">Dimensions</span>
                <div className="flex items-center gap-1">
                  <Ruler className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">
                    {washroom.length}' × {washroom.width}' × {washroom.height}'
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Floor Area</span>
                <span className="text-sm">{washroom.floorArea.toFixed(2)} sq. ft.</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Wall Area</span>
                <span className="text-sm">{washroom.wallArea.toFixed(2)} sq. ft.</span>
              </div>
            </div>
            
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Services Selected</span>
              <div className="flex flex-wrap gap-1">
                {washroom.services && Object.keys(washroom.services).filter(key => washroom.services[key]).length > 0 ? (
                  Object.entries(washroom.services)
                    .filter(([_, isSelected]) => isSelected)
                    .map(([serviceId]) => (
                      <Badge key={serviceId} variant="outline" className="text-xs">
                        {serviceNames[serviceId] || serviceId}
                      </Badge>
                    ))
                ) : (
                  <span className="text-xs italic text-muted-foreground">No services selected</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WashroomList;
