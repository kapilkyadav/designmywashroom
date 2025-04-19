import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { RealProjectService } from '@/services/real-projects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function GenerateQuotationDialog({ 
  project, 
  isOpen, 
  onClose 
}: { 
  project: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [washroomPricing, setWashroomPricing] = useState<any>({});
  const [totalPricing, setTotalPricing] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      loadPricing();
    }
  }, [isOpen, project]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      if (!project?.id) {
        throw new Error('Project ID is required');
      }
      
      const pricing = await RealProjectService.calculateProjectCosts(project.id);
      if (!pricing) {
        throw new Error('Failed to calculate project costs');
      }

      setWashroomPricing(pricing.washroomPricing || {});
      setTotalPricing({
        basePrice: pricing.projectTotalBasePrice || 0,
        gstAmount: pricing.projectTotalGST || 0,
        grandTotal: pricing.projectGrandTotal || 0
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
      setLoading(true);
      await RealProjectService.generateQuotation(project.id);
      onClose();
    } catch (error) {
      console.error('Error generating quotation:', error);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleGenerateQuotation}>Generate Quotation</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}