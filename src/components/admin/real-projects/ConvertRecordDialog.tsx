
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProjectCreateWizard from '@/components/admin/real-projects/creation/ProjectCreateWizard';
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
