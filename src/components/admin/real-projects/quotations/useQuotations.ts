
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RealProject, RealProjectService, ProjectQuotation } from '@/services/RealProjectService';

export const useQuotations = (project: RealProject, onUpdate: () => void) => {
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [viewQuotationHtml, setViewQuotationHtml] = useState<string | null>(null);
  const [quotationTerms, setQuotationTerms] = useState<string>(
    "1. This quotation is valid for 30 days.\n2. 50% advance required to start work.\n3. Project timeline will be finalized upon confirmation.\n4. Material specifications as per the quotation only."
  );
  
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
        totalAmount: (project.original_estimate || 0) + executionTotal + vendorTotal + additionalTotal,
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

  return {
    quotations,
    isLoading,
    isGeneratingQuote,
    isQuoteDialogOpen,
    setIsQuoteDialogOpen,
    viewQuotationHtml,
    setViewQuotationHtml,
    quotationTerms,
    setQuotationTerms,
    handleGenerateQuotation,
    viewQuotation,
    downloadAsPdf
  };
};
