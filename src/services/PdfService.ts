
import { toast } from '@/hooks/use-toast';

export class PdfService {
  /**
   * Generate PDF from HTML content using browser APIs
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
      iframe.style.width = '0';
      iframe.style.height = '0';
      
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
      
      // Use browser print functionality to save as PDF
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
      
      // For now, return null as we're using the browser's print dialog
      // In a future enhancement, we could integrate with a PDF generation library
      return null;
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
