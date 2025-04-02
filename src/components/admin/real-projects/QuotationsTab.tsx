
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RealProject, RealProjectService, ProjectQuotation } from '@/services/RealProjectService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, FilePdf, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface QuotationsTabProps {
  project: RealProject;
  onUpdate: () => void;
}

const QuotationsTab: React.FC<QuotationsTabProps> = ({ project, onUpdate }) => {
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [viewQuotationHtml, setViewQuotationHtml] = useState<string | null>(null);
  const [quotationTerms, setQuotationTerms] = useState<string>("1. This quotation is valid for 30 days.\n2. 50% advance required to start work.\n3. Project timeline will be finalized upon confirmation.\n4. Material specifications as per the quotation only.");
  
  const { data: quotations, isLoading, refetch } = useQuery({
    queryKey: ['project-quotations', project.id],
    queryFn: () => RealProjectService.getProjectQuotations(project.id),
  });
  
  const handleGenerateQuotation = async () => {
    setIsGeneratingQuote(true);
    
    try {
      // Calculate totals
      const executionTotal = Object.values(project.execution_costs || {}).reduce((sum, item: any) => sum + item.amount, 0);
      const vendorTotal = Object.values(project.vendor_rates || {}).reduce((sum, item: any) => sum + item.amount, 0);
      const additionalTotal = Object.values(project.additional_costs || {}).reduce((sum, item: any) => sum + item.amount, 0);
      
      // Create the items for the quotation
      const quotationItems = [
        {
          name: "Project Base Estimate",
          description: `${project.project_type} for ${project.length || 0} x ${project.width || 0} sqft`,
          amount: project.original_estimate || 0
        }
      ];
      
      // Add grouped costs
      if (executionTotal > 0) {
        quotationItems.push({
          name: "Execution & Labor",
          description: "Project execution and labor charges",
          amount: executionTotal
        });
      }
      
      if (vendorTotal > 0) {
        quotationItems.push({
          name: "Materials",
          description: "Materials and vendor supplies",
          amount: vendorTotal
        });
      }
      
      if (additionalTotal > 0) {
        quotationItems.push({
          name: "Additional Items",
          description: "Additional costs and services",
          amount: additionalTotal
        });
      }
      
      const quotationData = {
        items: quotationItems,
        totalAmount: project.original_estimate || 0 + executionTotal + vendorTotal + additionalTotal,
        terms: quotationTerms
      };
      
      const result = await RealProjectService.generateQuotation(project.id, quotationData);
      
      if (result.success) {
        // Update the project status to Quoted if it was In Progress
        if (project.status === 'In Progress') {
          await RealProjectService.updateRealProject(project.id, { status: 'Quoted' });
        }
        
        // Refresh the quotations list
        refetch();
        onUpdate();
      }
    } finally {
      setIsGeneratingQuote(false);
      setIsQuoteDialogOpen(false);
    }
  };
  
  const viewQuotation = async (quotationId: string) => {
    const quotation = await RealProjectService.getQuotation(quotationId);
    if (quotation && quotation.quotation_html) {
      setViewQuotationHtml(quotation.quotation_html);
    }
  };
  
  // Function to handle download as PDF
  const downloadAsPdf = (html: string, filename: string) => {
    // In a real app, you'd send this HTML to a server to convert to PDF
    // For now, we'll just open it in a new window
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
      // In a real app, you'd trigger the print dialog or download
      // newWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Project Quotations</h3>
        <Button onClick={() => setIsQuoteDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate New Quotation
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quotation Number</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : !quotations || quotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No quotations generated yet
                    </TableCell>
                  </TableRow>
                ) : (
                  quotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium">
                        {quotation.quotation_number}
                      </TableCell>
                      <TableCell>
                        {format(new Date(quotation.created_at), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{quotation.quotation_data.totalAmount.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => viewQuotation(quotation.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => quotation.quotation_html && downloadAsPdf(
                              quotation.quotation_html, 
                              `${quotation.quotation_number}.pdf`
                            )}
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Generate Quotation Dialog */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
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
                    <p className="font-medium">₹{Object.values(project.execution_costs || {})
                      .reduce((sum, item: any) => sum + item.amount, 0).toLocaleString('en-IN')}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Vendor Rates:</p>
                    <p className="font-medium">₹{Object.values(project.vendor_rates || {})
                      .reduce((sum, item: any) => sum + item.amount, 0).toLocaleString('en-IN')}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Additional Costs:</p>
                    <p className="font-medium">₹{Object.values(project.additional_costs || {})
                      .reduce((sum, item: any) => sum + item.amount, 0).toLocaleString('en-IN')}</p>
                  </div>
                  
                  <div className="col-span-2 pt-2 border-t">
                    <p className="text-muted-foreground">Total Quotation Amount:</p>
                    <p className="font-medium text-lg">₹{(
                      (project.original_estimate || 0) +
                      Object.values(project.execution_costs || {}).reduce((sum, item: any) => sum + item.amount, 0) +
                      Object.values(project.vendor_rates || {}).reduce((sum, item: any) => sum + item.amount, 0) +
                      Object.values(project.additional_costs || {}).reduce((sum, item: any) => sum + item.amount, 0)
                    ).toLocaleString('en-IN')}</p>
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
                  onChange={(e) => setQuotationTerms(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsQuoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateQuotation}
              disabled={isGeneratingQuote}
            >
              {isGeneratingQuote && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGeneratingQuote ? 'Generating...' : 'Generate Quotation'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View Quotation HTML Dialog */}
      <Dialog open={!!viewQuotationHtml} onOpenChange={(open) => !open && setViewQuotationHtml(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Quotation Preview</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setViewQuotationHtml(null)}
            >
              Close
            </Button>
            <Button 
              onClick={() => viewQuotationHtml && downloadAsPdf(viewQuotationHtml, `quotation-${project.project_id}.pdf`)}
            >
              <FilePdf className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </div>
          
          <div className="border rounded-md p-4 bg-white text-black">
            <iframe 
              srcDoc={viewQuotationHtml || ''}
              style={{ width: '100%', height: '60vh', border: 'none' }}
              title="Quotation Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotationsTab;
