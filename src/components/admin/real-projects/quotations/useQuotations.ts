
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RealProject, RealProjectService, ProjectQuotation } from '@/services/RealProjectService';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PdfService } from '@/services/PdfService';
import { supabase } from '@/lib/supabase';

export const useQuotations = (project: RealProject, onUpdate: () => void) => {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const [viewQuotationHtml, setViewQuotationHtml] = useState<string | null>(null);
  const [quotationTerms, setQuotationTerms] = useState<string>(
    'Standard terms and conditions apply. 50% advance payment required to start work. ' +
    'This quotation is valid for 30 days from the date of issue.'
  );
  
  const [internalPricingEnabled, setInternalPricingEnabled] = useState(false);
  
  const { data: quotations = [], isLoading, refetch } = useQuery({
    queryKey: ['project-quotations', project.id],
    queryFn: () => RealProjectService.getProjectQuotations(project.id),
    enabled: !!project.id,
  });
  
  // Debug: Log washrooms data when available
  useEffect(() => {
    const fetchProjectWashrooms = async () => {
      try {
        const washrooms = await RealProjectService.getProjectWashrooms(project.id);
        console.log('Project washrooms for quotation:', washrooms);
        
        // Check if washrooms have service details
        washrooms.forEach((washroom, index) => {
          console.log(`Washroom ${index + 1} (${washroom.name}):`, {
            services: washroom.services,
            serviceDetails: washroom.service_details
          });
        });
      } catch (error) {
        console.error('Error fetching washrooms:', error);
      }
    };
    
    if (project.id) {
      fetchProjectWashrooms();
    }
  }, [project.id]);
  
  const handleGenerateQuotation = async () => {
    try {
      setIsGeneratingQuote(true);
      
      // Prepare data for quotation generation
      const quotationData = {
        items: [],
        totalAmount: 0,
        terms: quotationTerms,
        internalPricing: internalPricingEnabled,
        margins: {},
        gstRate: 18
      };
      
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
  
  const downloadAsPdf = async (html: string, filename: string) => {
    try {
      const pdfBlob = await PdfService.generatePdfFromHtml(html, filename);
      
      if (!pdfBlob) {
        PdfService.downloadHtmlAsFile(html, filename.replace('.pdf', '.html'));
      }
    } catch (error: any) {
      console.error('Error downloading quotation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to download quotation',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteQuotations = async (quotationIds: string[]) => {
    try {
      const { error } = await supabase
        .from('project_quotations')
        .delete()
        .in('id', quotationIds);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Successfully deleted ${quotationIds.length} quotation${quotationIds.length !== 1 ? 's' : ''}`,
      });

      refetch();
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting quotations:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete quotations',
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
    internalPricingEnabled,
    setInternalPricingEnabled,
    handleGenerateQuotation,
    viewQuotation,
    downloadAsPdf,
    handleDeleteQuotations
  };
};
