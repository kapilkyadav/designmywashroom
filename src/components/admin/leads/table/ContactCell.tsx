
import React from 'react';
import { PhoneCall, Mail } from 'lucide-react';

interface ContactCellProps {
  phone: string;
  email: string | null;
}

const ContactCell: React.FC<ContactCellProps> = ({ phone, email }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <PhoneCall className="h-3 w-3 text-muted-foreground" />
        <a 
          href={`tel:${phone}`} 
          className="hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {phone}
        </a>
      </div>
      {email && (
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <a 
            href={`mailto:${email}`} 
            className="text-xs text-muted-foreground hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {email}
          </a>
        </div>
      )}
    </div>
  );
};

export default ContactCell;
