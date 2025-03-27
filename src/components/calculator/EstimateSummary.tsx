
import React from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  ArrowRight, 
  CalendarDays, 
  Square, 
  Ruler, 
  ShowerHead, 
  Zap
} from 'lucide-react';

const EstimateSummary = () => {
  const { state, resetCalculator } = useCalculator();
  
  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="animate-fade-in space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary">
          <Check className="h-10 w-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold">Your Estimate is Ready!</h2>
        <p className="text-muted-foreground">
          Based on your selections, here's the estimate for your dream washroom.
        </p>
      </div>
      
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Estimate Summary</h3>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(state.estimate.total)}
              </span>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <Square className="h-4 w-4 mr-2" />
                  Project Details
                </h4>
                
                <div className="space-y-2 ml-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project Type:</span>
                    <span className="font-medium capitalize">
                      {state.projectType.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium">
                      {state.dimensions.length} × {state.dimensions.width} × 9 ft
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Floor Area:</span>
                    <span className="font-medium">
                      {(state.dimensions.length * state.dimensions.width).toFixed(2)} sq ft
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeline:</span>
                    <span className="font-medium">
                      {state.timeline === 'standard' ? 'Standard (4 weeks)' : 'Flexible'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <Ruler className="h-4 w-4 mr-2" />
                  Selected Options
                </h4>
                
                <div className="space-y-3 ml-6">
                  {/* Electrical Fixtures */}
                  {(state.fixtures.electrical.ledMirror || 
                    state.fixtures.electrical.exhaustFan || 
                    state.fixtures.electrical.waterHeater) && (
                    <div>
                      <span className="text-sm font-medium flex items-center">
                        <Zap className="h-3 w-3 mr-1" /> Electrical
                      </span>
                      <ul className="mt-1 space-y-1">
                        {state.fixtures.electrical.ledMirror && (
                          <li className="text-sm flex items-center">
                            <Check className="h-3 w-3 text-primary mr-1" />
                            <span>LED Mirror</span>
                          </li>
                        )}
                        {state.fixtures.electrical.exhaustFan && (
                          <li className="text-sm flex items-center">
                            <Check className="h-3 w-3 text-primary mr-1" />
                            <span>Exhaust Fan</span>
                          </li>
                        )}
                        {state.fixtures.electrical.waterHeater && (
                          <li className="text-sm flex items-center">
                            <Check className="h-3 w-3 text-primary mr-1" />
                            <span>Water Heater</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {/* Plumbing Fixtures */}
                  {(state.fixtures.plumbing.completePlumbing || 
                    state.fixtures.plumbing.fixtureInstallationOnly) && (
                    <div>
                      <span className="text-sm font-medium flex items-center">
                        <ShowerHead className="h-3 w-3 mr-1" /> Plumbing
                      </span>
                      <ul className="mt-1 space-y-1">
                        {state.fixtures.plumbing.completePlumbing && (
                          <li className="text-sm flex items-center">
                            <Check className="h-3 w-3 text-primary mr-1" />
                            <span>Complete Plumbing</span>
                          </li>
                        )}
                        {state.fixtures.plumbing.fixtureInstallationOnly && (
                          <li className="text-sm flex items-center">
                            <Check className="h-3 w-3 text-primary mr-1" />
                            <span>Fixture Installation Only</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {/* Additional Fixtures */}
                  {(state.fixtures.additional.showerPartition || 
                    state.fixtures.additional.vanity || 
                    state.fixtures.additional.bathtub || 
                    state.fixtures.additional.jacuzzi) && (
                    <div>
                      <span className="text-sm font-medium">Additional</span>
                      <ul className="mt-1 space-y-1">
                        {state.fixtures.additional.showerPartition && (
                          <li className="text-sm flex items-center">
                            <Check className="h-3 w-3 text-primary mr-1" />
                            <span>Shower Partition</span>
                          </li>
                        )}
                        {state.fixtures.additional.vanity && (
                          <li className="text-sm flex items-center">
                            <Check className="h-3 w-3 text-primary mr-1" />
                            <span>Vanity</span>
                          </li>
                        )}
                        {state.fixtures.additional.bathtub && (
                          <li className="text-sm flex items-center">
                            <Check className="h-3 w-3 text-primary mr-1" />
                            <span>Bathtub</span>
                          </li>
                        )}
                        {state.fixtures.additional.jacuzzi && (
                          <li className="text-sm flex items-center">
                            <Check className="h-3 w-3 text-primary mr-1" />
                            <span>Jacuzzi</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3">Estimate Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fixtures</span>
                  <span>{formatCurrency(state.estimate.fixtureCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plumbing Work</span>
                  <span>{formatCurrency(state.estimate.plumbingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiling Work</span>
                  <span>{formatCurrency(state.estimate.tilingCost.total)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total Estimate</span>
                  <span className="text-primary">{formatCurrency(state.estimate.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button
          variant="outline"
          onClick={resetCalculator}
          className="order-2 sm:order-1"
        >
          Start New Estimate
        </Button>
        
        <Button className="order-1 sm:order-2">
          Download Estimate <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EstimateSummary;
