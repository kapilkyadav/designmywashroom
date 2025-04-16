
import React, { useEffect } from 'react';
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
    downloadAsPdf,
    handleDeleteQuotations
  } = useQuotations(project, onUpdate);

  // Enhanced debugging for data visualization
  useEffect(() => {
    // Check the window object for the current quotation data when available
    const checkQuotationData = () => {
      const quotationData = (window as any).currentQuotationData;
      if (quotationData) {
        console.log('Current quotation data:', quotationData);
        
        // Check if items have proper category info
        if (quotationData.items) {
          console.log('Items with categories:', quotationData.items.map((item: any) => ({
            name: item.name,
            category: item.category,
            isCategory: item.isCategory,
            description: item.description,
            serviceDetails: item.serviceDetails?.map((s: any) => ({
              serviceId: s.serviceId,
              serviceName: s.serviceName,
              categoryName: s.categoryName,
              categoryInMap: quotationData.serviceDetailsMap?.[s.serviceId]?.categoryName
            }))
          })));
        }
        
        // Check service details map
        if (quotationData.serviceDetailsMap) {
          console.log('Service details map (keys):', Object.keys(quotationData.serviceDetailsMap));
          const categoryGroups = {};
          Object.values(quotationData.serviceDetailsMap).forEach((service: any) => {
            const category = service.categoryName || 'Uncategorized';
            if (!categoryGroups[category]) {
              categoryGroups[category] = [];
            }
            categoryGroups[category].push(service);
          });
          console.log('Services grouped by category:', categoryGroups);
        }
      }
    };
    
    // Check at different points to ensure data is available
    if (isQuoteDialogOpen) {
      setTimeout(checkQuotationData, 1000);
    } else if (quotations.length > 0) {
      // Check if we have quotation data after a new one is generated
      setTimeout(checkQuotationData, 500);
    }
  }, [isQuoteDialogOpen, quotations.length]);

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
            onDeleteQuotations={handleDeleteQuotations}
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
