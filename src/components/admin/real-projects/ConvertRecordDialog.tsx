
import React from 'react';
import ConvertDialogContainer from '@/components/admin/real-projects/convert-dialog/ConvertDialogContainer';

interface ConvertRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

const ConvertRecordDialog: React.FC<ConvertRecordDialogProps> = ({
  open,
  onOpenChange,
  onProjectCreated
}) => {
  return (
    <ConvertDialogContainer
      open={open}
      onOpenChange={onOpenChange}
      onProjectCreated={onProjectCreated}
    />
  );
};

export default ConvertRecordDialog;
