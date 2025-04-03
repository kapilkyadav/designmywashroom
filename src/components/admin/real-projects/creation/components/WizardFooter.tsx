
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

interface WizardFooterProps {
  step: number;
  isSubmitting: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const WizardFooter: React.FC<WizardFooterProps> = ({
  step,
  isSubmitting,
  onBack,
  onCancel,
  onSubmit
}) => {
  return (
    <CardFooter className="flex justify-between">
      {step !== 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
      
      {step === 4 && (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Project
            </>
          )}
        </Button>
      )}
    </CardFooter>
  );
};

export default WizardFooter;
