import { toast } from '@/hooks/use-toast';

export class PdfService {
  /**
   * Generate PDF from HTML content using browser print functionality
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
      const printStyles = `
        <style>
          @page {
            size: A4;
            margin: 1cm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .container {
              padding: 0 !important;
              max-width: 100% !important;
            }
          }
        </style>
      `;
      
      // Fix image paths to absolute URLs
      const enhancedHtml = html.replace(/src="\/([^"]*)"/g, (match, p1) => {
        const absoluteUrl = window.location.origin + '/' + p1;
        return `src="${absoluteUrl}"`;
      });
      
      // Write the HTML content to the iframe
      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not access iframe document');
      
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>${printStyles}</head>
          <body>${enhancedHtml}</body>
        </html>
      `);
      iframeDoc.close();
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Focus and print the iframe
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
      
      // Clean up the iframe
      document.body.removeChild(iframe);
      
      toast({
        title: "Print Dialog Opened",
        description: "Save as PDF using your browser's print dialog",
      });
      
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
