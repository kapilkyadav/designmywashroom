
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ServiceItem } from '../hooks/useWashroomScope';

interface ServiceCategoryProps {
  category: string;
  services: ServiceItem[];
  washroomIndex: number;
  washroomServices: Record<string, boolean>;
  onServiceChange: (washroomIndex: number, serviceId: string, checked: boolean) => void;
  onSelectAllInCategory: (washroomIndex: number, category: string, checked: boolean) => void;
  areAllSelected: boolean;
  areSomeSelected: boolean;
}

const ServiceCategory: React.FC<ServiceCategoryProps> = ({
  category,
  services,
  washroomIndex,
  washroomServices,
  onServiceChange,
  onSelectAllInCategory,
  areAllSelected,
  areSomeSelected
}) => {
  return (
    <div className="p-3 border rounded-md bg-muted/30 mb-3">
      <div className="flex items-start mb-2">
        <div className="flex items-center h-5 mr-2">
          <Checkbox 
            id={`select-all-${category}-${washroomIndex}`}
            checked={areAllSelected}
            data-state={areSomeSelected && !areAllSelected ? 'indeterminate' : (areAllSelected ? 'checked' : 'unchecked')}
            onCheckedChange={(checked) => 
              onSelectAllInCategory(washroomIndex, category, !!checked)
            }
          />
          <div className={`${areSomeSelected && !areAllSelected ? 'bg-primary w-2 h-2 absolute rounded-sm' : 'hidden'}`} />
        </div>
        <div className="ml-2">
          <label 
            htmlFor={`select-all-${category}-${washroomIndex}`}
            className="font-semibold cursor-pointer"
          >
            {category}
          </label>
        </div>
      </div>

      <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-2">
        {services.map((service) => (
          <div key={service.id} className="flex items-center">
            <div className="flex items-center h-5">
              <Checkbox 
                id={`service-${service.id}-${washroomIndex}`}
                checked={washroomServices[service.id] || false}
                onCheckedChange={(checked) => 
                  onServiceChange(washroomIndex, service.id, !!checked)
                }
              />
            </div>
            <div className="ml-2">
              <label 
                htmlFor={`service-${service.id}-${washroomIndex}`}
                className="text-sm cursor-pointer"
              >
                {service.name || service.scope_of_work}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategory;
