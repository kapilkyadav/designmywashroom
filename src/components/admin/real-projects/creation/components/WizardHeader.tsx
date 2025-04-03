
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ConvertibleRecord } from '@/services/RealProjectService';

interface WizardHeaderProps {
  step: number;
  recordToConvert?: ConvertibleRecord;
}

const WizardHeader: React.FC<WizardHeaderProps> = ({ step, recordToConvert }) => {
  return (
    <CardHeader>
      <CardTitle>
        {recordToConvert 
          ? `Convert ${recordToConvert.record_type === 'lead' ? 'Lead' : 'Estimate'} to Project` 
          : "Create New Project"}
      </CardTitle>
      <CardDescription>
        Step {step} of 4
      </CardDescription>
    </CardHeader>
  );
};

export default WizardHeader;
