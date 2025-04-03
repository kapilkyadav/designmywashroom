
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ServiceItem } from '../hooks/useWashroomScope';

interface ServiceCategoryProps {
  category: string;
  services: ServiceItem[];
  washroomIndex: number;
  onServiceChange: (washroomIndex: number, serviceId: string, checked: boolean) => void;
  onSelectAllInCategory: (washroomIndex: number, category: string, checked: boolean) => void;
  areAllSelected: boolean;
  areSomeSelected: boolean;
  washroomServices: Record<string, boolean>;
}

const ServiceCategory: React.FC<ServiceCategoryProps> = ({
  category,
  services,
  washroomIndex,
  onServiceChange,
  onSelectAllInCategory,
  areAllSelected,
  areSomeSelected,
  washroomServices
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2 mb-2">
        <Checkbox 
          id={`category-${washroomIndex}-${category}`}
          checked={areAllSelected}
          indeterminate={!areAllSelected && areSomeSelected}
          onCheckedChange={(checked) => onSelectAllInCategory(washroomIndex, category, !!checked)}
        />
        <Label 
          htmlFor={`category-${washroomIndex}-${category}`}
          className="font-medium"
        >
          {category}
        </Label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
        {services.map(service => (
          <div key={service.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`service-${washroomIndex}-${service.id}`}
              checked={washroomServices[service.id] || false}
              onCheckedChange={(checked) => 
                onServiceChange(washroomIndex, service.id, !!checked)
              }
            />
            <Label 
              htmlFor={`service-${washroomIndex}-${service.id}`}
              className="text-sm"
            >
              {service.scope_of_work || service.name} {service.measuring_unit ? `(${service.measuring_unit})` : ''}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategory;
