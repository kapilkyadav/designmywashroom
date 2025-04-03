
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface EstimateActionsProps {
  resetCalculator: () => void;
}

const EstimateActions: React.FC<EstimateActionsProps> = ({ resetCalculator }) => {
  const handleDownload = () => {
    // In a real app, this would generate a PDF or other document
    toast.success("Estimate downloaded", {
      description: "Your estimate has been downloaded successfully."
    });
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    toast.success("Share link copied", {
      description: "Share link has been copied to clipboard."
    });
  };

  const handleContactDesigner = () => {
    // In a real app, this would trigger a contact form or call
    toast.success("Request sent", {
      description: "A designer will contact you shortly."
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Button className="flex-1" variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Estimate
        </Button>
        <Button className="flex-1" variant="outline" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Estimate
        </Button>
        <Button className="flex-1" onClick={handleContactDesigner}>
          Contact Designer
        </Button>
      </div>
      
      <div className="text-center">
        <Button variant="link" onClick={resetCalculator}>
          Start a New Estimate
        </Button>
      </div>
    </>
  );
};

export default EstimateActions;
