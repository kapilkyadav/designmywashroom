
import React from 'react';

interface EstimateHeaderProps {
  projectType: string;
  timeline: string;
  total: number;
}

const EstimateHeader: React.FC<EstimateHeaderProps> = ({ projectType, timeline, total }) => {
  // Function to format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-primary p-6 text-primary-foreground">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Total Estimate</h3>
          <p className="text-primary-foreground/80 text-sm">
            {projectType === 'new-construction' ? 'New Construction' : 'Renovation'} • 
            {timeline === 'standard' ? ' Standard Timeline (4 weeks)' : ' Flexible Timeline'}
          </p>
        </div>
        <div className="text-3xl font-bold mt-3 md:mt-0">{formatCurrency(total)}</div>
      </div>
    </div>
  );
};

export default EstimateHeader;
