
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CompleteStepProps {
  importedCount?: number;
  brandId?: string;
}

const CompleteStep: React.FC<CompleteStepProps> = ({ importedCount = 0, brandId }) => {
  const navigate = useNavigate();
  
  const handleViewProducts = () => {
    navigate('/admin/products');
  };
  
  return (
    <div className="py-10 text-center space-y-4">
      <div className="mx-auto flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <h3 className="text-lg font-medium">Import Complete</h3>
      <p className="text-sm text-muted-foreground">
        {importedCount} products have been imported successfully, and a daily sync at 10 AM has been scheduled.
      </p>
      <div className="flex justify-center mt-4">
        <Button onClick={handleViewProducts}>
          View Products
        </Button>
      </div>
    </div>
  );
};

export default CompleteStep;
