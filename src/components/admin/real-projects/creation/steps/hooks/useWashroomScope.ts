
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VendorRateCardService, VendorItem } from '@/services/VendorRateCardService';
import { WashroomWithAreas, ServiceDetail } from '../../types';

// Define a type for the service items
export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  scope_of_work?: string;
  category_id?: string;
  measuring_unit?: string;
  category_name?: string; 
}

export function useWashroomScope(initialWashrooms: WashroomWithAreas[]) {
  const [activeTab, setActiveTab] = useState<string>(initialWashrooms[0]?.name || '');
  const [washroomsWithScope, setWashroomsWithScope] = useState<WashroomWithAreas[]>(initialWashrooms);

  // Fetch all vendor items with their categories
  const { data: vendorItems = [], isLoading } = useQuery({
    queryKey: ['vendor-items-with-categories'],
    queryFn: async () => {
      const items = await VendorRateCardService.getItems();
      console.log("Fetched vendor items with categories:", items);
      return items;
    },
  });

  // Transform vendor items to service items format with better category handling
  const services: ServiceItem[] = vendorItems.map((item: VendorItem) => {
    // Ensure we have access to category data
    const categoryName = item.category?.name || "Uncategorized";
    const categoryId = item.category?.id || item.category_id || null;
    
    console.log(`Processing item ${item.id} - ${item.scope_of_work} with category:`, 
      { categoryName, categoryId, fullCategory: item.category });
    
    return {
      id: item.id,
      name: item.scope_of_work,
      category: categoryName,
      category_id: categoryId,
      category_name: categoryName,
      description: item.scope_of_work,
      scope_of_work: item.scope_of_work,
      measuring_unit: item.measuring_unit
    };
  });

  // Group services by category
  const servicesByCategory = services.reduce((acc: Record<string, ServiceItem[]>, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  // Create a map of service IDs to service details
  const serviceDetailsMap = services.reduce((acc: Record<string, ServiceItem>, service) => {
    acc[service.id] = service;
    return acc;
  }, {});

  // Log the services by category for debugging
  useEffect(() => {
    console.log('Services by category:', servicesByCategory);
    console.log('Service details map:', serviceDetailsMap);
    
    // Check if there are any selected services in washrooms
    console.log('Washrooms with scope:', washroomsWithScope.map(w => ({
      name: w.name,
      selectedServices: w.services ? Object.entries(w.services).filter(([_, selected]) => selected).length : 0
    })));
  }, [servicesByCategory, serviceDetailsMap, washroomsWithScope]);

  // Handle checkbox change for a service
  const handleServiceChange = (washroomIndex: number, serviceId: string, checked: boolean) => {
    const updatedWashrooms = [...washroomsWithScope];
    if (!updatedWashrooms[washroomIndex].services) {
      updatedWashrooms[washroomIndex].services = {};
    }
    updatedWashrooms[washroomIndex].services[serviceId] = checked;
    
    // Also update service_details structure for better display
    updateServiceDetails(updatedWashrooms, washroomIndex, serviceId, checked);
    
    setWashroomsWithScope(updatedWashrooms);
  };

  // Update service_details when services are changed
  const updateServiceDetails = (
    washrooms: WashroomWithAreas[], 
    washroomIndex: number, 
    serviceId: string, 
    checked: boolean
  ) => {
    const washroom = washrooms[washroomIndex];
    const serviceInfo = serviceDetailsMap[serviceId];
    
    if (!serviceInfo) return;
    
    // Initialize service_details if not present
    if (!washroom.service_details) {
      washroom.service_details = {};
    }
    
    const categoryId = serviceInfo.category_id || 'uncategorized';
    
    // Add or remove service from the category
    if (checked) {
      // Create category array if it doesn't exist
      if (!washroom.service_details[categoryId]) {
        washroom.service_details[categoryId] = [];
      }
      
      // Add service if not already present
      const serviceExists = washroom.service_details[categoryId].some(
        (s: ServiceDetail) => s.serviceId === serviceId
      );
      
      if (!serviceExists) {
        washroom.service_details[categoryId].push({
          serviceId,
          serviceName: serviceInfo.name,
          unit: serviceInfo.measuring_unit,
          categoryName: serviceInfo.category
        });
      }
    } else {
      // Remove service if category exists
      if (washroom.service_details[categoryId]) {
        washroom.service_details[categoryId] = washroom.service_details[categoryId].filter(
          (s: ServiceDetail) => s.serviceId !== serviceId
        );
        
        // Remove empty category
        if (washroom.service_details[categoryId].length === 0) {
          delete washroom.service_details[categoryId];
        }
      }
    }
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
      // Also update service_details
      updateServiceDetails(updatedWashrooms, washroomIndex, service.id, checked);
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

  // Get service name by ID for display purposes
  const getServiceNameById = (serviceId: string): string => {
    return serviceDetailsMap[serviceId]?.name || serviceId;
  };

  // Get category name for a service
  const getCategoryForService = (serviceId: string): string => {
    return serviceDetailsMap[serviceId]?.category || 'Uncategorized';
  };

  return {
    activeTab,
    setActiveTab,
    washroomsWithScope,
    services,
    servicesByCategory,
    serviceDetailsMap,
    isLoading,
    handleServiceChange,
    handleSelectAllInCategory,
    areAllServicesInCategorySelected,
    areSomeServicesInCategorySelected,
    getServiceNameById,
    getCategoryForService
  };
}
