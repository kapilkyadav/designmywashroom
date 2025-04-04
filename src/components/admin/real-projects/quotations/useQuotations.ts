
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RealProject, RealProjectService, ProjectQuotation } from '@/services/RealProjectService';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const useQuotations = (project: RealProject, onUpdate: () => void) => {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [viewQuotationHtml, setViewQuotationHtml] = useState<string | null>(null);
  const [quotationTerms, setQuotationTerms] = useState<string>(
    'Standard terms and conditions apply. 50% advance payment required to start work. ' +
    'This quotation is valid for 30 days from the date of issue.'
  );
  
  const { data: quotations = [], isLoading, refetch } = useQuery({
    queryKey: ['project-quotations', project.id],
    queryFn: () => RealProjectService.getProjectQuotations(project.id),
    enabled: !!project.id,
  });
  
  const handleGenerateQuotation = async () => {
    try {
      setIsGeneratingQuote(true);
      
      // Get quotation data from the dialog
      const quotationData = (window as any).currentQuotationData;
      if (!quotationData) {
        throw new Error('Quotation data not found');
      }
      
      const result = await RealProjectService.generateQuotation(
        project.id, 
        quotationData
      );
      
      if (result.success) {
        setIsQuoteDialogOpen(false);
        toast({
          title: 'Quotation Generated',
          description: 'Your quotation has been successfully generated',
        });
        
        refetch();
        onUpdate();
      } else {
        throw new Error('Failed to generate quotation');
      }
    } catch (error: any) {
      console.error('Error generating quotation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate quotation',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingQuote(false);
    }
  };
  
  const viewQuotation = async (quotationId: string) => {
    try {
      const quotation = await RealProjectService.getQuotation(quotationId);
      if (quotation && quotation.quotation_html) {
        setViewQuotationHtml(quotation.quotation_html);
      } else {
        throw new Error('Quotation HTML not found');
      }
    } catch (error: any) {
      console.error('Error viewing quotation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to view quotation',
        variant: 'destructive',
      });
    }
  };
  
  const downloadPdf = async (html: string, filename: string) => {
    try {
      // Create a blob from the HTML content
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create a link to download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'quotation.html';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Started',
        description: 'Your quotation download has started',
      });
    } catch (error: any) {
      console.error('Error downloading quotation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download quotation',
        variant: 'destructive',
      });
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
    downloadAsPdf: downloadPdf
  };
};
