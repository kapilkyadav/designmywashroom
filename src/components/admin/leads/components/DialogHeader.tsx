
import React from 'react';
import {
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';

interface DialogHeaderProps {
  customerName: string;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ customerName }) => {
  return (
    <SheetHeader>
      <SheetTitle>Lead Details</SheetTitle>
      <SheetDescription>
        View and modify details for {customerName}
      </SheetDescription>
    </SheetHeader>
  );
};

export default DialogHeader;
