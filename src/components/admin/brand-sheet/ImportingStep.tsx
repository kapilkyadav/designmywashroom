
import React from 'react';

const ImportingStep: React.FC = () => {
  return (
    <div className="py-10 text-center space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      <h3 className="text-lg font-medium">Importing Products</h3>
      <p className="text-sm text-muted-foreground">
        Please wait while we import your products and set up the daily sync schedule...
      </p>
    </div>
  );
};

export default ImportingStep;
