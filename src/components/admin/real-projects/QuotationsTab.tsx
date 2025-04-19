
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
    // Calculate project costs first
    const costs = await CostingService.calculateProjectCosts(
      project.id,
      project.washrooms || [],
      project.execution_costs || {}
    );

    if (!costs.execution_services_total && !costs.product_costs_total) {
      toast({
        title: "Missing cost data",
        description: "Please ensure execution services and product costs are calculated in the Execution Services tab first.",
        variant: "destructive"
      });
      return;
    }

    setIsQuoteDialogOpen(true);
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
