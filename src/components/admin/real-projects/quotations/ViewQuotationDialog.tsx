
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface ViewQuotationDialogProps {
  html: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (html: string, filename: string) => void;
  projectId: string;
}

const ViewQuotationDialog: React.FC<ViewQuotationDialogProps> = ({
  html,
  open,
  onOpenChange,
  onDownload,
  projectId
}) => {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Quotation Preview</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button 
            onClick={() => html && onDownload(html, `quotation-${projectId}.pdf`)}
            disabled={!html}
          >
            <FileText className="mr-2 h-4 w-4" />
            Download as PDF
          </Button>
        </div>
        
        <div className="border rounded-md p-4 bg-white text-black">
          {html ? (
            <iframe 
              srcDoc={html}
              style={{ width: '100%', height: '60vh', border: 'none' }}
              title="Quotation Preview"
            />
          ) : (
            <div className="text-center py-10 text-gray-500">
              No HTML content available to preview
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewQuotationDialog;
