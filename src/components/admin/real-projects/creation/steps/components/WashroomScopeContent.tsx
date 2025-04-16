
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ServiceCategory from './ServiceCategory';
import { ServiceItem } from '../hooks/useWashroomScope';
import { WashroomWithAreas } from '../../types';
import { Badge } from '@/components/ui/badge';

interface WashroomScopeContentProps {
  washroom: WashroomWithAreas;
  washroomIndex: number;
  servicesByCategory: Record<string, ServiceItem[]>;
  handleServiceChange: (washroomIndex: number, serviceId: string, checked: boolean) => void;
  handleSelectAllInCategory: (washroomIndex: number, category: string, checked: boolean) => void;
  areAllServicesInCategorySelected: (washroomIndex: number, category: string) => boolean;
  areSomeServicesInCategorySelected: (washroomIndex: number, category: string) => boolean;
}

const WashroomScopeContent: React.FC<WashroomScopeContentProps> = ({
  washroom,
  washroomIndex,
  servicesByCategory,
  handleServiceChange,
  handleSelectAllInCategory,
  areAllServicesInCategorySelected,
  areSomeServicesInCategorySelected
}) => {
  // Count selected services for this washroom
  const countSelectedServices = () => {
    if (!washroom.services) return 0;
    return Object.values(washroom.services).filter(Boolean).length;
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-2">
        <CardTitle className="text-lg">
          Scope of Work for {washroom.name}
        </CardTitle>
        <Badge variant="outline">
          {countSelectedServices()} service(s) selected
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(servicesByCategory).length === 0 ? (
          <p className="text-muted-foreground italic">
            No services available. Please add vendor items in the Vendor Rate Card section.
          </p>
        ) : (
          Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <ServiceCategory 
              key={category}
              category={category}
              services={categoryServices as ServiceItem[]}
              washroomIndex={washroomIndex}
              onServiceChange={handleServiceChange}
              onSelectAllInCategory={handleSelectAllInCategory}
              areAllSelected={areAllServicesInCategorySelected(washroomIndex, category)}
              areSomeSelected={areSomeServicesInCategorySelected(washroomIndex, category)}
              washroomServices={washroom.services || {}}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default WashroomScopeContent;
