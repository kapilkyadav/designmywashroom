
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ServiceItem } from '../hooks/useWashroomScope';
import { WashroomWithAreas } from '../../types';

interface ServiceCategoryProps {
  category: string;
  services: ServiceItem[];
  washroomIndex: number;
  washroomData: WashroomWithAreas;
  handleServiceChange: (washroomIndex: number, serviceId: string, checked: boolean) => void;
  handleSelectAllInCategory: (washroomIndex: number, category: string, checked: boolean) => void;
  areAllServicesInCategorySelected: (washroomIndex: number, category: string) => boolean;
  areSomeServicesInCategorySelected: (washroomIndex: number, category: string) => boolean;
}

const ServiceCategory: React.FC<ServiceCategoryProps> = ({
  category,
  services,
  washroomIndex,
  washroomData,
  handleServiceChange,
  handleSelectAllInCategory,
  areAllServicesInCategorySelected,
  areSomeServicesInCategorySelected
}) => {
  const isAllSelected = areAllServicesInCategorySelected(washroomIndex, category);
  const isSomeSelected = areSomeServicesInCategorySelected(washroomIndex, category);

  // Custom checkbox state that handles indeterminate state manually
  const checkboxRef = React.useRef<HTMLButtonElement>(null);
  
  // Set indeterminate property using ref
  React.useEffect(() => {
    if (checkboxRef.current) {
      // Directly set the indeterminate property on the DOM element
      (checkboxRef.current as any).dataset.indeterminate = isSomeSelected && !isAllSelected ? 'true' : 'false';
    }
  }, [isAllSelected, isSomeSelected]);
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            ref={checkboxRef}
            id={`category-${category}-${washroomIndex}`}
            checked={isAllSelected}
            data-state={isSomeSelected && !isAllSelected ? "indeterminate" : isAllSelected ? "checked" : "unchecked"}
            onCheckedChange={(checked) => 
              handleSelectAllInCategory(washroomIndex, category, !!checked)
            }
          />
          <Label 
            htmlFor={`category-${category}-${washroomIndex}`}
            className="text-base font-medium"
          >
            {category}
          </Label>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
          {services.map((service) => (
            <div key={service.id} className="flex items-center space-x-2">
              <Checkbox
                id={`service-${washroomIndex}-${service.id}`}
                checked={washroomData.services?.[service.id] || false}
                onCheckedChange={(checked) => 
                  handleServiceChange(washroomIndex, service.id, !!checked)
                }
              />
              <Label 
                htmlFor={`service-${washroomIndex}-${service.id}`}
                className="text-sm"
              >
                {service.name}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCategory;
