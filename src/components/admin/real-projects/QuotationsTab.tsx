
import React, { useState } from 'react';
import { RealProject } from '@/services/RealProjectService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import QuotationsList from './quotations/QuotationsList';
import GenerateQuotationDialog from './quotations/GenerateQuotationDialog';
import ViewQuotationDialog from './quotations/ViewQuotationDialog';
import { useQuotations } from './quotations/useQuotations';
import { toast } from '@/hooks/use-toast';
import { CostingService } from '@/services/real-projects/CostingService';

interface QuotationsTabProps {
  project: RealProject;
  onUpdate: () => void;
}

const QuotationsTab: React.FC<QuotationsTabProps> = ({ project, onUpdate }) => {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const {
    quotations,
    isLoading,
    isGeneratingQuote,
    viewQuotationHtml,
    setViewQuotationHtml,
    quotationTerms,
    setQuotationTerms,
    internalPricingEnabled,
    setInternalPricingEnabled,
    handleGenerateQuotation,
    viewQuotation,
    downloadAsPdf,
    deleteQuotations
  } = useQuotations(project, onUpdate);

  const handleGenerateNewQuotation = async () => {
    try {
      // Check if execution costs exist and are valid
      const hasValidExecutionCosts = project.execution_costs && 
        Object.entries(project.execution_costs).some(([_, value]) => value > 0);

      if (!hasValidExecutionCosts) {
        toast({
          title: "Missing execution costs",
          description: "Please add and save execution costs in the Execution Services tab first.",
          variant: "destructive"
        });
        return;
      }

      // Calculate project costs
      const costs = await CostingService.calculateProjectCosts(
        project.id,
        project.washrooms || [],
        project.execution_costs
      );

      if (!costs || costs.final_quotation_amount <= 0) {
        toast({
          title: "Invalid cost calculation",
          description: "Please ensure all costs are properly calculated and saved in the Execution Services tab.",
          variant: "destructive"
        });
        return;
      }

      // Store the calculated costs for quotation generation
      project.execution_services_total = costs.execution_services_total;
      project.product_costs_total = costs.product_costs_total;
      project.final_quotation_amount = costs.final_quotation_amount;

      setIsQuoteDialogOpen(true);
    } catch (error: any) {
      console.error("Error preparing quotation:", error);
      toast({
        title: "Error",
        description: "Failed to prepare quotation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuotations = async (quotationIds: string[]) => {
    if (!quotationIds.length) return;
    
    const success = await deleteQuotations(quotationIds);
    if (success) {
      toast({
        title: "Quotations deleted",
        description: `Successfully deleted ${quotationIds.length} quotation(s)`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Project Quotations</h3>
        <Button onClick={handleGenerateNewQuotation}>
          <Plus className="mr-2 h-4 w-4" />
          Generate New Quotation
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <QuotationsList 
            quotations={quotations}
            isLoading={isLoading}
            onViewQuotation={viewQuotation}
            onDownloadQuotation={downloadAsPdf}
            onDeleteQuotations={handleDeleteQuotations}
          />
        </CardContent>
      </Card>
      
      <GenerateQuotationDialog
        project={project}
        open={isQuoteDialogOpen}
        onOpenChange={setIsQuoteDialogOpen}
        quotationTerms={quotationTerms}
        onQuotationTermsChange={setQuotationTerms}
        onGenerateQuotation={handleGenerateQuotation}
        isGeneratingQuote={isGeneratingQuote}
        internalPricingEnabled={internalPricingEnabled}
        onInternalPricingChange={setInternalPricingEnabled}
      />
      
      <ViewQuotationDialog
        html={viewQuotationHtml}
        open={!!viewQuotationHtml}
        onOpenChange={() => setViewQuotationHtml(null)}
        onDownload={downloadAsPdf}
        projectId={project.id}
      />
    </div>
  );
};

export default QuotationsTab;
