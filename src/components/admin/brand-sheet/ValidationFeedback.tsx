
import React, { memo } from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface ValidationFeedbackProps {
  isValid: boolean | null;
  error: string;
}

const ValidationFeedback: React.FC<ValidationFeedbackProps> = memo(({ isValid, error }) => {
  if (isValid === null) return null;
  
  if (isValid) {
    return (
      <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md p-3 flex items-start">
        <Check className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm">Sheet validated successfully! You can now import products.</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-md p-3 flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }
  
  return null;
});

ValidationFeedback.displayName = 'ValidationFeedback';

export default ValidationFeedback;
