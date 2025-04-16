
import React from 'react';
import { RealProject } from '@/services/RealProjectService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import QuotationsList from './quotations/QuotationsList';
import GenerateQuotationDialog from './quotations/GenerateQuotationDialog';
import ViewQuotationDialog from './quotations/ViewQuotationDialog';
import { useQuotations } from './quotations/useQuotations';

interface QuotationsTabProps {
  project: RealProject;
  onUpdate: () => void;
}

const QuotationsTab: React.FC<QuotationsTabProps> = ({ project, onUpdate }) => {
  const {
    quotations,
    isLoading,
    isGeneratingQuote,
    isQuoteDialogOpen,
    setIsQuoteDialogOpen,
    viewQuotationHtml,
    setViewQuotationHtml,
    quotationTerms,
    setQuotationTerms,
    internalPricingEnabled,
    setInternalPricingEnabled,
    handleGenerateQuotation,
    viewQuotation,
    downloadAsPdf
  } = useQuotations(project, onUpdate);

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
          <QuotationsList 
            quotations={quotations}
            isLoading={isLoading}
            onViewQuotation={viewQuotation}
            onDownloadQuotation={downloadAsPdf}
          />
        </CardContent>
      </Card>
      
      {/* Generate Quotation Dialog */}
      <GenerateQuotationDialog
        open={isQuoteDialogOpen}
        onOpenChange={setIsQuoteDialogOpen}
        project={project}
        quotationTerms={quotationTerms}
        onQuotationTermsChange={setQuotationTerms}
        onGenerateQuotation={handleGenerateQuotation}
        isGeneratingQuote={isGeneratingQuote}
        internalPricingEnabled={internalPricingEnabled}
        onInternalPricingChange={setInternalPricingEnabled}
      />
      
      {/* View Quotation HTML Dialog */}
      <ViewQuotationDialog
        html={viewQuotationHtml}
        open={!!viewQuotationHtml}
        onOpenChange={() => setViewQuotationHtml(null)}
        onDownload={downloadAsPdf}
        projectId={project.project_id}
      />
    </div>
  );
};

export default QuotationsTab;
