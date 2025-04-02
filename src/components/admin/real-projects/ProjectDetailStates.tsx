
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

interface ErrorStateProps {
  onBackClick?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onBackClick }) => {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate('/admin/real-projects');
    }
  };
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertDescription>
        Error loading project. The project may have been deleted or you don't have permission to view it.
        <div className="mt-4">
          <Button onClick={handleBackClick}>
            Back to Projects
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
