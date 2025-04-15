
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf'; // Changed from 'import jsPDF from 'jspdf'' to 'import { jsPDF } from 'jspdf''
import html2canvas from 'html2canvas';

export class PdfService {
  /**
   * Generate PDF from HTML content using jsPDF and html2canvas
   */
  static async generatePdfFromHtml(
    html: string, 
    filename: string = 'document.pdf'
  ): Promise<Blob | null> {
    try {
      // Create an iframe to render the HTML
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.width = '8.27in'; // A4 width
      iframe.style.height = '11.69in'; // A4 height
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      // Add print styles for better PDF rendering
      const additionalStyles = `
        <style>
          @page {
            size: A4;
            margin: 1cm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .container {
              padding: 0 !important;
              max-width: 100% !important;
            }
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead {
              display: table-header-group;
            }
            tfoot {
              display: table-footer-group;
            }
          }
        </style>
      `;
      
      // Inject additional styles
      const enhancedHtml = html.replace('</head>', `${additionalStyles}\n</head>`);
      
      // Write the HTML content to the iframe
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not access iframe document');
      
      iframeDoc.open();
      iframeDoc.write(enhancedHtml);
      iframeDoc.close();
      
      // Wait for images and resources to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Try generating PDF using jsPDF and html2canvas
        const contentElement = iframeDoc.body;
        const canvas = await html2canvas(contentElement, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const contentWidth = canvas.width;
        const contentHeight = canvas.height;
        
        // A4 dimensions in points (72 dpi)
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        
        // Calculate the number of pages
        const pagesCount = Math.ceil(contentHeight * (pageWidth / contentWidth) / pageHeight);
        
        // Create PDF with A4 size
        const pdf = new jsPDF('p', 'pt', 'a4');
        
        // For each page, add a new PDF page and render the canvas section
        let position = 0;
        for (let i = 0; i < pagesCount; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          
          const srcWidth = contentWidth;
          const srcHeight = (pageHeight / (pageWidth / contentWidth));
          const srcX = 0;
          const srcY = position;
          
          position += srcHeight;
          
          pdf.addImage(
            canvas,
            'PNG',
            0,
            0,
            pageWidth,
            srcHeight * (pageWidth / contentWidth),
            '',
            'FAST',
            0
          );
        }
        
        // Save the PDF
        pdf.save(filename);
        
        // Clean up the iframe
        document.body.removeChild(iframe);
        
        toast({
          title: 'PDF Generated',
          description: 'Your document has been generated and downloaded.',
        });
        
        // Return the PDF as a blob
        return pdf.output('blob');
      } catch (jsPdfError) {
        console.error('Error generating PDF with jsPDF:', jsPdfError);
        
        // Fallback to browser print functionality
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }
        
        // Clean up the iframe
        document.body.removeChild(iframe);
        
        toast({
          title: 'PDF Generated',
          description: 'Save the document using your browser\'s print dialog',
        });
        
        return null;
      }
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'PDF Generation Error',
        description: error.message || 'Failed to generate PDF',
        variant: 'destructive',
      });
      return null;
    }
  }

  /**
   * Save the HTML content as a file for download
   */
  static downloadHtmlAsFile(html: string, filename: string): void {
    try {
      // Create a blob from the HTML content
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create a link to download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'document.html';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Started',
        description: 'Your document download has started',
      });
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Download Error',
        description: error.message || 'Failed to download document',
        variant: 'destructive',
      });
    }
  }
}
