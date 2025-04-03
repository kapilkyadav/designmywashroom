
import React from 'react';
import { Button } from '@/components/ui/button';
import { WashroomWithAreas } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowRight } from 'lucide-react';
import { useWashroomScope } from './hooks/useWashroomScope';
import WashroomScopeContent from './components/WashroomScopeContent';

interface WashroomScopeStepProps {
  washrooms: WashroomWithAreas[];
  onSubmit: (washrooms: WashroomWithAreas[]) => void;
}

const WashroomScopeStep: React.FC<WashroomScopeStepProps> = ({ washrooms, onSubmit }) => {
  const {
    activeTab,
    setActiveTab,
    washroomsWithScope,
    servicesByCategory,
    isLoading,
    handleServiceChange,
    handleSelectAllInCategory,
    areAllServicesInCategorySelected,
    areSomeServicesInCategorySelected,
  } = useWashroomScope(washrooms);

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
              <WashroomScopeContent 
                washroom={washroomsWithScope[washroomIndex]}
                washroomIndex={washroomIndex}
                servicesByCategory={servicesByCategory}
                handleServiceChange={handleServiceChange}
                handleSelectAllInCategory={handleSelectAllInCategory}
                areAllServicesInCategorySelected={areAllServicesInCategorySelected}
                areSomeServicesInCategorySelected={areSomeServicesInCategorySelected}
              />
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
