import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RealProjectService } from '@/services/real-projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GenerateQuotationDialogProps {
  project: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationTerms: string;
  onQuotationTermsChange: (terms: string) => void;
  onGenerateQuotation: () => Promise<void>;
  isGeneratingQuote: boolean;
  internalPricingEnabled: boolean;
  onInternalPricingChange: (enabled: boolean) => void;
}

export default function GenerateQuotationDialog({ 
  project,
  open,
  onOpenChange,
  quotationTerms,
  onQuotationTermsChange,
  onGenerateQuotation,
  isGeneratingQuote,
  internalPricingEnabled,
  onInternalPricingChange
}: GenerateQuotationDialogProps) {
  const [loading, setLoading] = useState(true);
  const [washroomPricing, setWashroomPricing] = useState<any>({});
  const [totalPricing, setTotalPricing] = useState<any>({});

  useEffect(() => {
    if (open) {
      loadPricing();
    }
  }, [open, project]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      if (!project?.id) {
        throw new Error('Project ID is required');
      }

      // Check if execution costs exist
      if (!project.execution_costs || Object.keys(project.execution_costs).length === 0) {
        toast({
          title: "Missing execution costs",
          description: "Please add and save execution costs in the Execution Services tab first.",
          variant: "destructive"
        });
        onOpenChange(false);
        return;
      }

      const pricing = await RealProjectService.calculateProjectCosts(
        project.id,
        project.washrooms || [],
        project.execution_costs || {}
      );

      if (!pricing) {
        throw new Error('Failed to calculate project costs');
      }

      // Set washroom pricing
      const washroomPricingData = pricing.washroom_costs || {};
      setWashroomPricing(washroomPricingData);

      // Calculate totals
      // Use project's calculated totals if pricing calculation fails
      const executionTotal = pricing?.execution_services_total || project.execution_services_total || 0;
      const productTotal = pricing?.product_costs_total || project.product_costs_total || 0;
      const basePrice = executionTotal + productTotal;
      const gstAmount = basePrice * 0.18; // 18% GST
      const grandTotal = basePrice + gstAmount;

      setTotalPricing({
        basePrice,
        executionTotal,
        productTotal,
        gstAmount,
        grandTotal,
        hasCustomFormulas: false
      });
    } catch (error: any) {
      console.error('Error loading pricing:', error);
      toast({
        title: "Error loading pricing",
        description: error.message || "Failed to load project pricing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuotation = async () => {
    try {
      await onGenerateQuotation();
    } catch (error) {
      console.error('Error generating quotation:', error);
    }
  };

  if (loading || isGeneratingQuote) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>Generate Quotation</DialogTitle>
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Project Summary</TabsTrigger>
            <TabsTrigger value="washrooms">Washroom Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Project Cost Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>Execution Services Cost:</div>
                  <div>₹{(totalPricing?.executionTotal || 0).toFixed(2)}</div>
                  <div>Fixtures Cost:</div>
                  <div>₹{(totalPricing?.fixturesTotal || 0).toFixed(2)}</div>
                  <div>Product Cost:</div>
                  <div>₹{(totalPricing?.productTotal || 0).toFixed(2)}</div>
                  <div className="border-t pt-2">Base Price (Total):</div>
                  <div className="border-t pt-2">₹{(totalPricing?.basePrice || 0).toFixed(2)}</div>
                  <div>GST (18% on Execution):</div>
                  <div>₹{(totalPricing?.gstAmount || 0).toFixed(2)}</div>
                  {totalPricing?.hasCustomFormulas && (
                    <div className="text-sm text-muted-foreground col-span-2">
                      * Some items use custom pricing formulas
                    </div>
                  )}
                  <div className="font-bold border-t pt-2">Grand Total:</div>
                  <div className="font-bold border-t pt-2">₹{(totalPricing?.grandTotal || 0).toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="washrooms">
            <div className="space-y-4">
              {project.washrooms?.map((washroom: any) => (
                <Card key={washroom.id}>
                  <CardHeader>
                    <CardTitle>{washroom.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div>Execution Services:</div>
                      <div>₹{(washroomPricing[washroom.id]?.executionCost || 0).toFixed(2)}</div>
                      <div>Fixtures:</div>
                      <div>₹{(washroomPricing[washroom.id]?.fixturesCost || 0).toFixed(2)}</div>
                      <div>Products:</div>
                      <div>₹{(washroomPricing[washroom.id]?.productCost || 0).toFixed(2)}</div>
                      <div className="border-t pt-2">Base Price:</div>
                      <div className="border-t pt-2">₹{(washroomPricing[washroom.id]?.basePrice || 0).toFixed(2)}</div>
                      <div>GST (18% on Execution):</div>
                      <div>₹{(washroomPricing[washroom.id]?.gstAmount || 0).toFixed(2)}</div>
                      <div className="font-bold border-t pt-2">Total:</div>
                      <div className="font-bold border-t pt-2">
                        ₹{(washroomPricing[washroom.id]?.totalPrice || 0).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleGenerateQuotation} disabled={isGeneratingQuote}>
            {isGeneratingQuote ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Quotation'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}