
import React, { memo } from 'react';
import BrandSheetMappingContainer from './brand-sheet/BrandSheetMappingContainer';

interface BrandSheetMappingProps {
  brandId: string;
  onComplete: () => void;
}

const BrandSheetMapping: React.FC<BrandSheetMappingProps> = memo(({ 
  brandId, 
  onComplete 
}) => {
  return <BrandSheetMappingContainer brandId={brandId} onComplete={onComplete} />;
});

BrandSheetMapping.displayName = 'BrandSheetMapping';

export default BrandSheetMapping;
