
import React from 'react';
import { Check } from 'lucide-react';

interface SummaryHeaderProps {
  customerName: string;
}

const SummaryHeader: React.FC<SummaryHeaderProps> = ({ customerName }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
        <Check className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Your Washroom Estimate is Ready!</h2>
      <p className="text-muted-foreground">
        Thank you, {customerName}! Here's a detailed breakdown of your custom washroom design estimate.
      </p>
    </div>
  );
};

export default SummaryHeader;
