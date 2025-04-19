import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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

      // Get project washrooms first
      const washrooms = await RealProjectService.getProjectWashrooms(project.id);
      if (!washrooms) {
        throw new Error('Failed to fetch washrooms');
      }

      const executionCosts = {};
      const pricing = await RealProjectService.calculateProjectCosts(
        project.id,
        washrooms,
        executionCosts
      );

      if (!pricing) {
        throw new Error('Failed to calculate project costs');
      }

      setWashroomPricing(pricing.washroomPricing || {});
      setTotalPricing({
        basePrice: pricing.projectTotalBasePrice || 0,
        gstAmount: pricing.projectTotalGST || 0,
        grandTotal: pricing.projectGrandTotal || 0,
        hasCustomFormulas: pricing.hasCustomFormulas || false // Added to handle custom formulas
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
                  <div>Base Price:</div>
                  <div>₹{totalPricing.basePrice.toFixed(2)}</div>
                  <div>GST:</div>
                  <div>₹{totalPricing.gstAmount.toFixed(2)}</div>
                  {totalPricing.hasCustomFormulas && (
                    <div className="text-sm text-muted-foreground col-span-2">
                      * Some items use custom pricing formulas
                    </div>
                  )}
                  <div className="font-bold">Total:</div>
                  <div className="font-bold">₹{totalPricing.grandTotal.toFixed(2)}</div>
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
                      <div>Base Price:</div>
                      <div>₹{washroomPricing[washroom.id]?.basePrice.toFixed(2)}</div>
                      <div>GST:</div>
                      <div>₹{washroomPricing[washroom.id]?.gstAmount.toFixed(2)}</div>
                      <div className="font-bold">Total:</div>
                      <div className="font-bold">
                        ₹{washroomPricing[washroom.id]?.totalPrice.toFixed(2)}
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