
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { RealProject, RealProjectService } from '@/services/RealProjectService';
import { QuotationService } from '@/services/real-projects/QuotationService';
import { FixtureService } from '@/services/FixtureService';
import InternalPricingSection from './InternalPricingSection';

interface GenerateQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: RealProject;
  quotationTerms: string;
  onQuotationTermsChange: (terms: string) => void;
  onGenerateQuotation: () => void;
  isGeneratingQuote: boolean;
  internalPricingEnabled: boolean;
  onInternalPricingChange: (enabled: boolean) => void;
}

const GenerateQuotationDialog: React.FC<GenerateQuotationDialogProps> = ({
  open,
  onOpenChange,
  project,
  quotationTerms,
  onQuotationTermsChange,
  onGenerateQuotation,
  isGeneratingQuote,
  internalPricingEnabled,
  onInternalPricingChange
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [washrooms, setWashrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [quotationItems, setQuotationItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const [margins, setMargins] = useState<Record<string, number>>({});
  const [gstRate, setGstRate] = useState(18);
  const [internalPricingDetails, setInternalPricingDetails] = useState<Record<string, any> | undefined>(undefined);
  
  useEffect(() => {
    if (open && project.id) {
      loadWashrooms();
    }
  }, [open, project.id]);
  
  const loadWashrooms = async () => {
    setLoading(true);
    try {
      const washroomData = await RealProjectService.getProjectWashrooms(project.id);
      setWashrooms(washroomData);
      
      const initialMargins: Record<string, number> = {};
      washroomData.forEach(w => { initialMargins[w.id] = 0 });
      setMargins(initialMargins);
      
      // Calculate costs after loading washroom data
      await calculateCosts(washroomData);
    } catch (error) {
      console.error('Error loading washrooms:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateCosts = async (washroomData: any[]) => {
    try {
      const executionCosts = {};
      const costData = await RealProjectService.calculateProjectCosts(
        project.id,
        washroomData,
        executionCosts
      );
      
      const items: any[] = [];
      const serviceCategories: Record<string, any> = {};
      
      // Load fixtures if available in the project
      const fixtures: any[] = [];
      if (project.selected_fixtures) {
        try {
          // Fetch fixture details
          const fixtureIds = Object.keys(project.selected_fixtures || {}).filter(id => 
            project.selected_fixtures?.[id] === true
          );
          
          if (fixtureIds.length > 0) {
            const fixtureDetails = await FixtureService.getFixturesByIds(fixtureIds);
            
            fixtureDetails.forEach(fixture => {
              fixtures.push({
                id: fixture.id,
                name: fixture.name,
                category: fixture.category,
                mrp: fixture.mrp,
                amount: fixture.client_price > 0 ? fixture.client_price : fixture.mrp * 0.9,
                isFixture: true
              });
            });
          }
        } catch (error) {
          console.error('Error loading fixtures:', error);
        }
      }
      
      washroomData.forEach(washroom => {
        if (washroom.services) {
          Object.entries(washroom.services).forEach(([serviceId, isSelected]) => {
            if (isSelected) {
              const serviceRate = costData.service_rates[serviceId] || 0;
              const measurementUnit = costData.service_measurements[serviceId] || '';
              const serviceDetails = costData.service_details?.[serviceId] || {};
              
              // Get service name and category
              const serviceName = serviceDetails.name || `Service ${serviceId}`;
              const serviceCategory = serviceDetails.category || 'General';
              
              // Create category entry if it doesn't exist
              if (!serviceCategories[serviceCategory]) {
                serviceCategories[serviceCategory] = {
                  washroomId: washroom.id,
                  name: serviceCategory,
                  description: `${washroom.name} - ${serviceCategory} Services`,
                  services: [],
                  totalAmount: 0,
                  isCategory: true
                };
              }
              
              let serviceCost = serviceRate;
              if (
                measurementUnit.toLowerCase().includes('sqft') || 
                measurementUnit.toLowerCase().includes('sft') || 
                measurementUnit.toLowerCase().includes('sq ft') || 
                measurementUnit.toLowerCase().includes('square')
              ) {
                const area = washroom.length * washroom.width;
                serviceCost = serviceRate * area;
              }
              
              // Add to the category's services
              serviceCategories[serviceCategory].services.push({
                serviceId,
                name: serviceName,
                cost: serviceCost,
                unit: measurementUnit
              });
              
              // Add to the category's total
              serviceCategories[serviceCategory].totalAmount += serviceCost;
            }
          });
        }
        
        // Add each service category as an item
        Object.values(serviceCategories).forEach((category: any) => {
          if (category.totalAmount > 0) {
            items.push({
              washroomId: category.washroomId,
              name: category.name,
              description: category.description,
              mrp: category.totalAmount * 1.2,
              amount: category.totalAmount,
              isCategory: true,
              serviceDetails: category.services,
              applyGst: true, // Apply GST to execution services
              isExecutionService: true // Mark as execution service
            });
          }
        });
        
        if (washroom.selected_brand) {
          const brandCost = costData.washroom_costs[washroom.id]?.productCosts || 0;
          if (brandCost > 0) {
            items.push({
              washroomId: washroom.id,
              name: `${washroom.selected_brand} Products`,
              description: `Complete set of ${washroom.selected_brand} products for ${washroom.name}`,
              mrp: brandCost * 1.2,
              amount: brandCost,
              isBrandProduct: true, // Mark as brand product
              applyGst: false // Don't apply GST to product costs as they already include tax
            });
          }
        }
      });
      
      // Add fixtures to the items array
      fixtures.forEach(fixture => {
        items.push({
          name: fixture.name,
          description: `${fixture.category} - ${fixture.name}`,
          mrp: fixture.mrp,
          amount: fixture.amount,
          isFixture: true, // Mark as fixture
          applyGst: true // Apply GST to fixtures
        });
      });
      
      const calculatedTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      
      setQuotationItems(items);
      setTotalAmount(calculatedTotal);
      
      if (internalPricingEnabled) {
        calculateInternalPricing(items);
      }
    } catch (error) {
      console.error('Error calculating costs:', error);
    }
  };
  
  const calculateInternalPricing = (items: any[]) => {
    if (!internalPricingEnabled) return;
    
    try {
      const details = QuotationService.calculateInternalPricing(
        washrooms,
        items,
        margins,
        gstRate
      );
      
      setInternalPricingDetails(details);
    } catch (error) {
      console.error('Error calculating internal pricing:', error);
    }
  };
  
  const handleInternalPricingToggle = (enabled: boolean) => {
    onInternalPricingChange(enabled);
    
    if (enabled) {
      calculateInternalPricing(quotationItems);
    } else {
      setInternalPricingDetails(undefined);
    }
  };
  
  const handleMarginsChange = (newMargins: Record<string, number>) => {
    setMargins(newMargins);
    calculateInternalPricing(quotationItems);
  };
  
  const handleGstRateChange = (rate: number) => {
    setGstRate(rate);
    calculateInternalPricing(quotationItems);
  };
  
  const handleSubmit = () => {
    (window as any).currentQuotationData = {
      items: quotationItems,
      totalAmount,
      terms: quotationTerms,
      internalPricing: internalPricingEnabled,
      margins,
      gstRate,
      internalPricingDetails
    };
    
    onGenerateQuotation();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Quotation</DialogTitle>
          <DialogDescription>
            Create a detailed quotation for this project to share with the client.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="internal">Internal Pricing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Quotation Summary</h3>
                  <p>Total items: {quotationItems.length}</p>
                  <p>Total amount: ₹{totalAmount.toLocaleString('en-IN')}</p>
                  
                  {/* Show cost breakdown by type */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="text-md font-medium mb-2">Cost Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Execution Services:</span>
                        <span>₹{quotationItems
                          .filter(item => item.isExecutionService)
                          .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
                          .toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Brand Products:</span>
                        <span>₹{quotationItems
                          .filter(item => item.isBrandProduct)
                          .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
                          .toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fixtures:</span>
                        <span>₹{quotationItems
                          .filter(item => item.isFixture)
                          .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
                          .toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    className="min-h-32"
                    value={quotationTerms}
                    onChange={(e) => onQuotationTermsChange(e.target.value)}
                    placeholder="Enter terms and conditions for the quotation..."
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="internal">
              <InternalPricingSection
                washrooms={washrooms}
                onMarginsChange={handleMarginsChange}
                onGstRateChange={handleGstRateChange}
                onInternalPricingToggle={handleInternalPricingToggle}
                internalPricing={internalPricingEnabled}
                margins={margins}
                gstRate={gstRate}
                internalPricingDetails={internalPricingDetails}
              />
            </TabsContent>
          </Tabs>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isGeneratingQuote || loading}>
            {isGeneratingQuote ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Quotation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateQuotationDialog;
