
import React from 'react';
import BrandSheetMappingContainer from './brand-sheet/BrandSheetMappingContainer';

interface BrandSheetMappingProps {
  brandId: string;
  onComplete: () => void;
}

const BrandSheetMapping: React.FC<BrandSheetMappingProps> = ({ 
  brandId, 
  onComplete 
}) => {
  return <BrandSheetMappingContainer brandId={brandId} onComplete={onComplete} />;
};

export default BrandSheetMapping;
