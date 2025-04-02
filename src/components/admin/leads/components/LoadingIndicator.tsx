
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
    </div>
  );
};

export default LoadingIndicator;
