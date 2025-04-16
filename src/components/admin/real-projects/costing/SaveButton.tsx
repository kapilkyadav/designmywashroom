
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface SaveButtonProps {
  onClick: () => void;
  isSaving: boolean;
  className?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onClick, isSaving, className }) => {
  return (
    <Button className={className} onClick={onClick} disabled={isSaving}>
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </>
      )}
    </Button>
  );
};

export default SaveButton;
