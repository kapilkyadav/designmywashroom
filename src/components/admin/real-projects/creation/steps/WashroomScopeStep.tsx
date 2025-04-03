
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { WashroomWithAreas } from '../ProjectCreateWizard';
import { ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { RealProjectService } from '@/services/RealProjectService';
import { Loader2 } from 'lucide-react';

interface WashroomScopeStepProps {
  washrooms: WashroomWithAreas[];
  onSubmit: (washrooms: WashroomWithAreas[]) => void;
}

const WashroomScopeStep: React.FC<WashroomScopeStepProps> = ({ washrooms, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<string>(washrooms[0]?.name || '');
  const [washroomsWithScope, setWashroomsWithScope] = useState<WashroomWithAreas[]>(washrooms);

  // Fetch all execution services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['execution-services'],
    queryFn: () => RealProjectService.getExecutionServices(),
  });

  // Group services by category
  const servicesByCategory = services.reduce((acc: Record<string, any[]>, service) => {
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

  const handleSubmit = () => {
    onSubmit(washroomsWithScope);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Scope of Work for Each Washroom</h3>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {washrooms.map((washroom, index) => (
              <TabsTrigger key={index} value={washroom.name}>
                {washroom.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {washrooms.map((washroom, washroomIndex) => (
            <TabsContent key={washroomIndex} value={washroom.name}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Scope of Work for {washroom.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.keys(servicesByCategory).length === 0 ? (
                    <p className="text-muted-foreground italic">
                      No services available. Please add execution services in the admin panel.
                    </p>
                  ) : (
                    Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`select-all-${washroomIndex}-${category}`}
                            checked={areAllServicesInCategorySelected(washroomIndex, category)}
                            onCheckedChange={(checked) => 
                              handleSelectAllInCategory(washroomIndex, category, checked === true)
                            }
                            className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                            data-state={areSomeServicesInCategorySelected(washroomIndex, category) ? "indeterminate" : undefined}
                          />
                          <Label 
                            htmlFor={`select-all-${washroomIndex}-${category}`}
                            className="font-semibold text-lg"
                          >
                            {category}
                          </Label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-6">
                          {categoryServices.map((service: any) => (
                            <div key={service.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`service-${washroomIndex}-${service.id}`}
                                checked={washroomsWithScope[washroomIndex]?.services?.[service.id] === true}
                                onCheckedChange={(checked) => 
                                  handleServiceChange(washroomIndex, service.id, checked === true)
                                }
                              />
                              <Label htmlFor={`service-${washroomIndex}-${service.id}`}>
                                {service.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      <div className="pt-4 flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading}>
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WashroomScopeStep;
