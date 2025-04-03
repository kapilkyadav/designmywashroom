
import React from 'react';
import { User, Phone, Mail, MapPin } from 'lucide-react';
import { ProjectInfoValues } from '../../types';

interface ClientInformationProps {
  clientInfo: ProjectInfoValues;
}

const ClientInformation: React.FC<ClientInformationProps> = ({ clientInfo }) => {
  return (
    <div>
      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Client Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{clientInfo.client_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{clientInfo.client_mobile}</span>
        </div>
        {clientInfo.client_email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{clientInfo.client_email}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{clientInfo.client_location}</span>
        </div>
      </div>
    </div>
  );
};

export default ClientInformation;
