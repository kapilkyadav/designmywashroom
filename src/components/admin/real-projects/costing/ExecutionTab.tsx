
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
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

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
      if (!servicesByCategory[service.category]) {
        servicesByCategory[service.category] = [];
      }
      servicesByCategory[service.category].push(service);
    });
  }
  
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
                <TableCell className="font-medium">Tiling Work</TableCell>
                <TableCell className="text-right">
                  ₹{costSummary.tiling_cost?.toLocaleString('en-IN') || 0}
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
      
      {/* Execution services pricing */}
      {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
        <Card key={category} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-secondary px-4 py-3">
              <h4 className="font-medium">{category} Services</h4>
            </div>
            <Separator />
            
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4">
                {categoryServices.map(service => (
                  <div key={service.id} className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-2">
                      <Label htmlFor={`service-cost-${service.id}`}>{service.name}</Label>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="mr-2 text-muted-foreground">₹</span>
                        <Input
                          id={`service-cost-${service.id}`}
                          type="number"
                          min="0"
                          step="1"
                          value={executionCosts[service.id] || ''}
                          onChange={(e) => handleCostChange(service.id, parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <div className="flex justify-end">
        <Button 
          onClick={saveCosts}
          disabled={isUpdating}
        >
          {isUpdating && <Save className="mr-2 h-4 w-4 animate-spin" />}
          Save Execution Costs
        </Button>
      </div>
    </div>
  );
};

export default ExecutionTab;
