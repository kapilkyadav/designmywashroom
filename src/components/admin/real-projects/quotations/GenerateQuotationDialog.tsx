
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
      
      washroomData.forEach(washroom => {
        if (washroom.services) {
          Object.entries(washroom.services).forEach(([serviceId, isSelected]) => {
            if (isSelected) {
              const serviceRate = costData.service_rates[serviceId] || 0;
              const measurementUnit = costData.service_measurements[serviceId] || '';
              
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
              
              const serviceName = `Service ID: ${serviceId}`;
              
              items.push({
                washroomId: washroom.id,
                serviceId,
                name: serviceName,
                description: `${washroom.name} - ${measurementUnit}`,
                mrp: serviceCost * 1.2,
                amount: serviceCost
              });
            }
          });
        }
        
        if (washroom.selected_brand) {
          const brandCost = costData.washroom_costs[washroom.id]?.productCosts || 0;
          if (brandCost > 0) {
            items.push({
              washroomId: washroom.id,
              name: `${washroom.selected_brand} Products`,
              description: `Complete set of ${washroom.selected_brand} products for ${washroom.name}`,
              mrp: brandCost * 1.2,
              amount: brandCost
            });
          }
        }
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
