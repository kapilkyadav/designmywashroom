
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { RealProject } from '@/services/RealProjectService';

interface GenerateQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: RealProject;
  quotationTerms: string;
  onQuotationTermsChange: (terms: string) => void;
  onGenerateQuotation: () => Promise<void>;
  isGeneratingQuote: boolean;
}

const GenerateQuotationDialog: React.FC<GenerateQuotationDialogProps> = ({
  open,
  onOpenChange,
  project,
  quotationTerms,
  onQuotationTermsChange,
  onGenerateQuotation,
  isGeneratingQuote
}) => {
  // Calculate totals for display
  const executionTotal = Object.values(project.execution_costs || {})
    .reduce((sum, item: any) => sum + item.amount, 0);
  
  const vendorTotal = Object.values(project.vendor_rates || {})
    .reduce((sum, item: any) => sum + item.amount, 0);
  
  const additionalTotal = Object.values(project.additional_costs || {})
    .reduce((sum, item: any) => sum + item.amount, 0);
  
  const totalAmount = (project.original_estimate || 0) + executionTotal + vendorTotal + additionalTotal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate New Quotation</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Card className="mb-4">
            <CardHeader className="py-2">
              <CardTitle className="text-base">Quotation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Original Estimate:</p>
                  <p className="font-medium">₹{(project.original_estimate || 0).toLocaleString('en-IN')}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-muted-foreground">Execution Costs:</p>
                  <p className="font-medium">₹{executionTotal.toLocaleString('en-IN')}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-muted-foreground">Vendor Rates:</p>
                  <p className="font-medium">₹{vendorTotal.toLocaleString('en-IN')}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-muted-foreground">Additional Costs:</p>
                  <p className="font-medium">₹{additionalTotal.toLocaleString('en-IN')}</p>
                </div>
                
                <div className="col-span-2 pt-2 border-t">
                  <p className="text-muted-foreground">Total Quotation Amount:</p>
                  <p className="font-medium text-lg">₹{totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={quotationTerms}
                onChange={(e) => onQuotationTermsChange(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={onGenerateQuotation}
            disabled={isGeneratingQuote}
          >
            {isGeneratingQuote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGeneratingQuote ? 'Generating...' : 'Generate Quotation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateQuotationDialog;
