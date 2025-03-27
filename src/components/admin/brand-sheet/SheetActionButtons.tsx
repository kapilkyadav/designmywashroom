
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ExternalLink, 
  Loader2, 
  RefreshCcw, 
  Check,
  XCircle 
} from 'lucide-react';

interface SheetActionButtonsProps {
  sheetUrl: string;
  validating: boolean;
  importing: boolean;
  scheduled: boolean;
  isValid: boolean | null;
  onValidate: () => void;
  onCancel: () => void;
  onImport: () => void;
  onOpenSheet: () => void;
}

const SheetActionButtons: React.FC<SheetActionButtonsProps> = ({
  sheetUrl,
  validating,
  importing,
  scheduled,
  isValid,
  onValidate,
  onCancel,
  onImport,
  onOpenSheet,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
      <Button 
        variant="outline"
        type="button"
        onClick={onOpenSheet}
        disabled={!sheetUrl}
        className="w-full sm:w-auto"
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        Open Sheet
      </Button>
      
      <div className="flex gap-3 w-full sm:w-auto">
        {validating ? (
          <Button
            type="button"
            variant="destructive"
            onClick={onCancel}
            className="flex-1 sm:flex-auto"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onValidate}
            disabled={validating || importing || !sheetUrl}
            className="flex-1 sm:flex-auto"
          >
            {validating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate'
            )}
          </Button>
        )}
        
        <Button
          type="button"
          onClick={onImport}
          disabled={!isValid || importing || scheduled}
          className="flex-1 sm:flex-auto"
        >
          {scheduled ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Scheduled
            </>
          ) : importing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting Up...
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Import & Schedule
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SheetActionButtons;
