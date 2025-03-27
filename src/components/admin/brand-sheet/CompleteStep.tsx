
import React from 'react';
import { CheckCircle } from 'lucide-react';

const CompleteStep: React.FC = () => {
  return (
    <div className="py-10 text-center space-y-4">
      <div className="mx-auto flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <h3 className="text-lg font-medium">Import Complete</h3>
      <p className="text-sm text-muted-foreground">
        Your products have been imported successfully, and a daily sync at 10 AM has been scheduled.
      </p>
    </div>
  );
};

export default CompleteStep;
