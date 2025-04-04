
import React, { useState, useEffect } from 'react';
import { RealProject, RealProjectService } from '@/services/RealProjectService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ExecutionTabProps {
  project: RealProject;
  onUpdate: () => void;
}

const ExecutionTab: React.FC<ExecutionTabProps> = ({ project, onUpdate }) => {
  const [executionCosts, setExecutionCosts] = useState<Record<string, number>>({});
  const [tilingRates, setTilingRates] = useState<{ per_tile_cost: number, tile_laying_cost: number }>({
    per_tile_cost: 0,
    tile_laying_cost: 0
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [costSummary, setCostSummary] = useState<Record<string, any>>({});
  const [serviceRates, setServiceRates] = useState<Record<string, number>>({});
  const [serviceMeasurements, setServiceMeasurements] = useState<Record<string, string>>({});
  const [activeWashroomTab, setActiveWashroomTab] = useState<string>('all');
  
  // Fetch execution services
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['execution-services'],
    queryFn: () => RealProjectService.getExecutionServices()
  });
  
  // Fetch tiling rates
  const { data: ratesData } = useQuery({
    queryKey: ['tiling-rates'],
    queryFn: () => RealProjectService.getTilingRates()
  });
  
  useEffect(() => {
    // Initialize execution costs from project
    if (project.execution_costs) {
      setExecutionCosts(project.execution_costs);
    }
    
    // Set tiling rates
    if (ratesData) {
      setTilingRates(ratesData);
    }
    
    // Set initial active washroom tab
    if (project.washrooms && project.washrooms.length > 0) {
      setActiveWashroomTab('all');
    }
  }, [project, ratesData]);
  
  // Calculate costs when washrooms, execution costs, or services change
  useEffect(() => {
    const calculateCosts = async () => {
      if (!project.washrooms || !services) return;
      
      try {
        const calculatedCosts = await RealProjectService.calculateProjectCosts(
          project.id,
          project.washrooms,
          executionCosts
        );
        
        setCostSummary(calculatedCosts);
        
        // If we have service rates and measurements, update our state
        if (calculatedCosts.service_rates) {
          setServiceRates(calculatedCosts.service_rates);
          
          // Pre-fill execution costs with rates from vendor rate cards if not already set
          const updatedCosts = { ...executionCosts };
          Object.entries(calculatedCosts.service_rates).forEach(([serviceId, rate]) => {
            if (!updatedCosts[serviceId]) {
              updatedCosts[serviceId] = rate as number;
            }
          });
          
          setExecutionCosts(updatedCosts);
        }
        
        if (calculatedCosts.service_measurements) {
          setServiceMeasurements(calculatedCosts.service_measurements);
        }
      } catch (error) {
        console.error("Error calculating costs:", error);
      }
    };
    
    calculateCosts();
  }, [project.washrooms, executionCosts, services, project.id]);
  
  const handleCostChange = (serviceId: string, value: number) => {
    setExecutionCosts(prev => ({
      ...prev,
      [serviceId]: value
    }));
  };
  
  const saveCosts = async () => {
    setIsUpdating(true);
    
    try {
      await project.updateCosts({
        execution_costs: executionCosts,
        vendor_rates: project.vendor_rates || {},
        additional_costs: project.additional_costs || {},
        washrooms: project.washrooms || [],
        final_quotation_amount: costSummary.final_quotation_amount || 0
      });
      
      toast({
        title: "Costs updated",
        description: "Execution costs have been saved successfully.",
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Failed to save costs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (isLoadingServices) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // Group services by category
  const servicesByCategory: Record<string, any[]> = {};
  if (services) {
    services.forEach(service => {
      const categoryName = service.category?.name || "Uncategorized";
      if (!servicesByCategory[categoryName]) {
        servicesByCategory[categoryName] = [];
      }
      servicesByCategory[categoryName].push(service);
    });
  }
  
  // Filter services by selected washroom
  const filteredServices = (selectedWashroomId: string) => {
    if (selectedWashroomId === 'all') {
      return services || [];
    } else {
      const selectedWashroom = project.washrooms?.find(w => w.id === selectedWashroomId);
      if (!selectedWashroom || !selectedWashroom.services) return [];
      
      return services?.filter(service => selectedWashroom.services?.[service.id]) || [];
    }
  };
  
  // Group filtered services by category for a specific washroom
  const filteredServicesByCategory = (selectedWashroomId: string) => {
    const filtered = filteredServices(selectedWashroomId);
    const result: Record<string, any[]> = {};
    
    filtered.forEach(service => {
      const categoryName = service.category?.name || "Uncategorized";
      if (!result[categoryName]) {
        result[categoryName] = [];
      }
      result[categoryName].push(service);
    });
    
    return result;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Execution Services & Costing</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="text-sm font-medium text-muted-foreground">Total Area</h4>
              <p className="text-2xl font-semibold mt-1">
                {costSummary.total_area?.toFixed(2) || 0} sq ft
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="text-sm font-medium text-muted-foreground">Combined Tiling Rate</h4>
              <p className="text-2xl font-semibold mt-1">
                ₹{costSummary.combined_tiling_rate?.toFixed(2) || 0}/sq ft
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (₹{tilingRates.per_tile_cost} + ₹{tilingRates.tile_laying_cost})
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="text-sm font-medium text-muted-foreground">Final Quotation Amount</h4>
              <p className="text-2xl font-semibold mt-1 text-primary">
                ₹{costSummary.final_quotation_amount?.toLocaleString('en-IN') || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Cost breakdown */}
      <Card>
        <CardContent className="p-0">
          <div className="bg-secondary px-4 py-3">
            <h4 className="font-medium">Cost Breakdown</h4>
          </div>
          <Separator />
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Execution Services</TableCell>
                <TableCell className="text-right">
                  ₹{costSummary.execution_services_total?.toLocaleString('en-IN') || 0}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Product Costs</TableCell>
                <TableCell className="text-right">
                  ₹{costSummary.product_costs_total?.toLocaleString('en-IN') || 0}
                </TableCell>
              </TableRow>
              <TableRow className="font-semibold">
                <TableCell>Final Quotation Amount</TableCell>
                <TableCell className="text-right">
                  ₹{costSummary.final_quotation_amount?.toLocaleString('en-IN') || 0}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Washroom specific costs */}
      {project.washrooms && project.washrooms.length > 0 && costSummary.washroom_costs && (
        <Card>
          <CardContent className="p-0">
            <div className="bg-secondary px-4 py-3">
              <h4 className="font-medium">Washroom Cost Details</h4>
            </div>
            <Separator />
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Washroom</TableHead>
                  <TableHead className="text-right">Execution Services</TableHead>
                  <TableHead className="text-right">Product Costs</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.washrooms.map(washroom => {
                  const washroomCost = costSummary.washroom_costs?.[washroom.id] || {
                    executionServices: 0,
                    productCosts: 0,
                    totalCost: 0
                  };
                  
                  return (
                    <TableRow key={washroom.id}>
                      <TableCell>
                        <span className="font-medium">{washroom.name}</span>
                        <div className="text-xs text-muted-foreground">
                          {washroom.selected_brand && `Brand: ${washroom.selected_brand}`}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{washroomCost.executionServices?.toLocaleString('en-IN') || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{washroomCost.productCosts?.toLocaleString('en-IN') || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{washroomCost.totalCost?.toLocaleString('en-IN') || 0}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Execution services pricing */}
      <Card>
        <CardContent className="p-0">
          <div className="bg-secondary px-4 py-3">
            <h4 className="font-medium">Execution Services Pricing</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Edit service rates for cost calculation
            </p>
          </div>
          <Separator />
          
          <div className="p-4">
            {project.washrooms && project.washrooms.length > 0 && (
              <Tabs value={activeWashroomTab} onValueChange={setActiveWashroomTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Services</TabsTrigger>
                  {project.washrooms.map(washroom => (
                    <TabsTrigger key={washroom.id} value={washroom.id}>{washroom.name}</TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value="all">
                  {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                    <div key={category} className="mt-4">
                      <h5 className="font-medium text-sm mb-2">{category} Services</h5>
                      
                      <div className="space-y-3">
                        {categoryServices.map(service => {
                          // Get suggested rate from vendor rate card if available
                          const suggestedRate = serviceRates[service.id] || 0;
                          const currentRate = executionCosts[service.id] || suggestedRate;
                          const measurementUnit = service.measuring_unit || '';
                          
                          return (
                            <div key={service.id} className="grid grid-cols-3 gap-4 items-center">
                              <div className="col-span-2">
                                <Label htmlFor={`service-cost-${service.id}`}>{service.scope_of_work}</Label>
                                <p className="text-sm text-muted-foreground">
                                  {measurementUnit && `Unit: ${measurementUnit}`}
                                  {suggestedRate > 0 && ` • Suggested rate: ₹${suggestedRate}`}
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <span className="mr-2 text-muted-foreground">₹</span>
                                  <Input
                                    id={`service-cost-${service.id}`}
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={currentRate || ''}
                                    onChange={(e) => handleCostChange(service.id, parseFloat(e.target.value) || 0)}
                                    className="text-right"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                {project.washrooms.map(washroom => {
                  const filteredCategoryServices = filteredServicesByCategory(washroom.id);
                  
                  return (
                    <TabsContent key={washroom.id} value={washroom.id}>
                      <div className="mb-4">
                        <h5 className="text-lg font-medium">{washroom.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {washroom.length} × {washroom.width} ft ({washroom.area.toFixed(2)} sq ft)
                          {washroom.selected_brand && ` • Brand: ${washroom.selected_brand}`}
                        </p>
                      </div>
                      
                      {Object.keys(filteredCategoryServices).length > 0 ? (
                        Object.entries(filteredCategoryServices).map(([category, categoryServices]) => (
                          <div key={category} className="mt-4">
                            <h5 className="font-medium text-sm mb-2">{category} Services</h5>
                            
                            <div className="space-y-3">
                              {categoryServices.map(service => {
                                // Get suggested rate from vendor rate card if available
                                const suggestedRate = serviceRates[service.id] || 0;
                                const currentRate = executionCosts[service.id] || suggestedRate;
                                const measurementUnit = service.measuring_unit || '';
                                
                                // Calculate estimated cost based on measurement unit and dimensions
                                let estimatedCost = currentRate;
                                const measurementLower = measurementUnit.toLowerCase();
                                if (measurementLower.includes('sqft') || measurementLower.includes('sft') || 
                                    measurementLower.includes('sq ft') || measurementLower.includes('square')) {
                                  estimatedCost = currentRate * washroom.area;
                                }
                                
                                return (
                                  <div key={service.id} className="grid grid-cols-4 gap-4 items-center">
                                    <div className="col-span-2">
                                      <Label htmlFor={`service-cost-${service.id}`}>{service.scope_of_work}</Label>
                                      <p className="text-sm text-muted-foreground">
                                        {measurementUnit && `Unit: ${measurementUnit}`}
                                      </p>
                                    </div>
                                    <div>
                                      <div className="flex items-center">
                                        <span className="mr-2 text-muted-foreground">₹</span>
                                        <Input
                                          id={`service-cost-${service.id}`}
                                          type="number"
                                          min="0"
                                          step="1"
                                          value={currentRate || ''}
                                          onChange={(e) => handleCostChange(service.id, parseFloat(e.target.value) || 0)}
                                          className="text-right"
                                        />
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p>
                                        ₹{estimatedCost.toLocaleString('en-IN')}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Estimated cost
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-muted-foreground">
                          No services selected for this washroom
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={saveCosts}
          disabled={isUpdating}
        >
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Execution Costs
        </Button>
      </div>
    </div>
  );
};

export default ExecutionTab;
