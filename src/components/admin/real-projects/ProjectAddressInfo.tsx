
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RealProject } from '@/services/RealProjectService';
import { MapPin, Building, Loader } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ProjectAddressInfoProps {
  project: RealProject;
}

const ProjectAddressInfo: React.FC<ProjectAddressInfoProps> = ({ project }) => {
  // Extract address details from project_details
  const address = project.project_details?.address || 'Address not specified';
  const floorNumber = project.project_details?.floor_number;
  const hasServiceLift = project.project_details?.service_lift_available;
  
  return (
    <Card className="border-0 shadow-none bg-muted/40">
      <CardContent className="p-4">
        <h3 className="font-medium mb-3">Project Location</h3>
        
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Address</Label>
            <div className="flex items-start gap-2 mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm">{address}</p>
            </div>
          </div>
          
          {floorNumber && (
            <div>
              <Label className="text-xs text-muted-foreground">Floor Number</Label>
              <div className="flex items-center gap-2 mt-1">
                <Building className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{floorNumber}</p>
              </div>
            </div>
          )}
          
          <div>
            <Label className="text-xs text-muted-foreground">Service Lift</Label>
            <div className="flex items-center gap-2 mt-1">
              <Loader className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{hasServiceLift ? 'Available' : 'Not Available'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectAddressInfo;
