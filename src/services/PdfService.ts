import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from '@/hooks/use-toast';

export class PdfService {
  static async generatePdfFromHtml(
    html: string,
    filename: string = 'document.pdf'
  ): Promise<void> {
    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = html;
      container.style.width = '210mm'; // A4 width
      container.style.padding = '10mm';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      // Render the HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2, // Higher quality
        useCORS: true, // Allow cross-origin images
        logging: false,
        allowTaint: true,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let firstPage = true;

      // Add pages iteratively
      while (heightLeft >= 0) {
        if (!firstPage) {
          pdf.addPage();
        }
        const currentHeight = Math.min(pageHeight, heightLeft);
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          position,
          imgWidth,
          imgHeight,
          '',
          'FAST'
        );
        heightLeft -= pageHeight;
        position -= pageHeight;
        firstPage = false;
      }

      // Save the PDF
      pdf.save(filename);

      // Clean up
      document.body.removeChild(container);

      toast({
        title: "PDF Generated",
        description: "Your PDF has been generated and downloaded",
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'PDF Generation Error',
        description: error.message || 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  }

  static downloadHtmlAsFile(html: string, filename: string): void {
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'document.html';
      document.body.appendChild(link);
      link.click();
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