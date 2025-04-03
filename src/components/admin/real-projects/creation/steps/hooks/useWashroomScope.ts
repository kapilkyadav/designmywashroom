
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RealProjectService } from '@/services/RealProjectService';
import { WashroomWithAreas } from '../../types';

// Define a type for the service items
export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export function useWashroomScope(initialWashrooms: WashroomWithAreas[]) {
  const [activeTab, setActiveTab] = useState<string>(initialWashrooms[0]?.name || '');
  const [washroomsWithScope, setWashroomsWithScope] = useState<WashroomWithAreas[]>(initialWashrooms);

  // Fetch all execution services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['execution-services'],
    queryFn: () => RealProjectService.getExecutionServices(),
  });

  // Group services by category
  const servicesByCategory = services.reduce((acc: Record<string, ServiceItem[]>, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  // Handle checkbox change for a service
  const handleServiceChange = (washroomIndex: number, serviceId: string, checked: boolean) => {
    const updatedWashrooms = [...washroomsWithScope];
    if (!updatedWashrooms[washroomIndex].services) {
      updatedWashrooms[washroomIndex].services = {};
    }
    updatedWashrooms[washroomIndex].services[serviceId] = checked;
    setWashroomsWithScope(updatedWashrooms);
  };

  // Handle the "Select All" checkbox for a category
  const handleSelectAllInCategory = (washroomIndex: number, category: string, checked: boolean) => {
    const updatedWashrooms = [...washroomsWithScope];
    const washroomServices = { ...updatedWashrooms[washroomIndex].services };

    // Get all services in this category
    const servicesInCategory = servicesByCategory[category] || [];
    
    // Update all services in this category
    servicesInCategory.forEach(service => {
      washroomServices[service.id] = checked;
    });
    
    updatedWashrooms[washroomIndex].services = washroomServices;
    setWashroomsWithScope(updatedWashrooms);
  };
  
  // Check if all services in a category are selected
  const areAllServicesInCategorySelected = (washroomIndex: number, category: string) => {
    const servicesInCategory = servicesByCategory[category] || [];
    if (servicesInCategory.length === 0) return false;
    
    const washroomServices = washroomsWithScope[washroomIndex]?.services || {};
    return servicesInCategory.every(service => washroomServices[service.id] === true);
  };
  
  // Check if some (but not all) services in a category are selected
  const areSomeServicesInCategorySelected = (washroomIndex: number, category: string) => {
    const servicesInCategory = servicesByCategory[category] || [];
    if (servicesInCategory.length === 0) return false;
    
    const washroomServices = washroomsWithScope[washroomIndex]?.services || {};
    const selectedCount = servicesInCategory.filter(service => washroomServices[service.id] === true).length;
    return selectedCount > 0 && selectedCount < servicesInCategory.length;
  };

  return {
    activeTab,
    setActiveTab,
    washroomsWithScope,
    services,
    servicesByCategory,
    isLoading,
    handleServiceChange,
    handleSelectAllInCategory,
    areAllServicesInCategorySelected,
    areSomeServicesInCategorySelected,
  };
}
