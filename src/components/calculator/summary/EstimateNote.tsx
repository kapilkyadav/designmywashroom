
import React from 'react';

const EstimateNote: React.FC = () => {
  return (
    <div className="bg-secondary/50 rounded-lg p-4 mt-6">
      <h4 className="text-sm font-medium mb-2">Note</h4>
      <p className="text-sm text-muted-foreground">
        This estimate is valid for 30 days. Actual costs may vary based on site conditions and final material selections. 
        A detailed quotation will be provided after an on-site assessment.
      </p>
    </div>
  );
};

export default EstimateNote;
