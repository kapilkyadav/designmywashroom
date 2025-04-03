
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
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={`select-all-${washroomIndex}-${category}`}
          checked={areAllSelected}
          onCheckedChange={(checked) => 
            onSelectAllInCategory(washroomIndex, category, checked === true)
          }
          className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
          data-state={areSomeSelected ? "indeterminate" : undefined}
        />
        <Label 
          htmlFor={`select-all-${washroomIndex}-${category}`}
          className="font-semibold text-lg"
        >
          {category}
        </Label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-6">
        {services.map((service) => (
          <div key={service.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`service-${washroomIndex}-${service.id}`}
              checked={washroomServices?.[service.id] === true}
              onCheckedChange={(checked) => 
                onServiceChange(washroomIndex, service.id, checked === true)
              }
            />
            <Label htmlFor={`service-${washroomIndex}-${service.id}`}>
              {service.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategory;
