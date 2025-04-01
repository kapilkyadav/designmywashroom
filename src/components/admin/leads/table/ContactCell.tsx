
import React from 'react';
import { PhoneCall, Mail } from 'lucide-react';

interface ContactCellProps {
  phone: string;
  email: string | null;
}

const ContactCell: React.FC<ContactCellProps> = ({ phone, email }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        <PhoneCall className="h-3 w-3 text-muted-foreground" />
        <span>{phone}</span>
      </div>
      {email && (
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{email}</span>
        </div>
      )}
    </div>
  );
};

export default ContactCell;
