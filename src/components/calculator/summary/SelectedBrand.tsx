
import React from 'react';

interface SelectedBrandProps {
  brandName: string;
}

const SelectedBrand: React.FC<SelectedBrandProps> = ({ brandName }) => {
  return (
    <div>
      <h5 className="text-sm font-medium text-muted-foreground mb-2">Selected Brand</h5>
      <p className="text-base">
        {brandName || 'Custom Selection'}
      </p>
    </div>
  );
};

export default SelectedBrand;
