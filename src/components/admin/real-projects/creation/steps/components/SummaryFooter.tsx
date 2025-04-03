
import React from 'react';
import { WashroomWithAreas } from '../../types';

interface SummaryFooterProps {
  washroomCount: number;
  serviceCount: number;
}

const SummaryFooter: React.FC<SummaryFooterProps> = ({ washroomCount, serviceCount }) => {
  return (
    <div className="mt-6 bg-muted p-3 rounded-md">
      <p className="text-sm text-muted-foreground">
        You are about to create a new project with {washroomCount} washroom(s) and {serviceCount} service(s).
        Click "Create Project" to continue.
      </p>
    </div>
  );
};

export default SummaryFooter;
