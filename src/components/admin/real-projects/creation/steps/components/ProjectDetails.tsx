
import React from 'react';
import { HomeIcon, MapPin, Building, Loader } from 'lucide-react';
import { ProjectInfoValues } from '../../types';

interface ProjectDetailsProps {
  projectInfo: ProjectInfoValues;
  brandName: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ projectInfo, brandName }) => {
  return (
    <div>
      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Project Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <HomeIcon className="h-4 w-4 text-muted-foreground" />
          <span>Project Type: <span className="font-medium">{projectInfo.project_type}</span></span>
        </div>
        {brandName && (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>Brand: <span className="font-medium">{brandName}</span></span>
          </div>
        )}
        <div className="flex items-center gap-2 col-span-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>Address: <span className="font-medium">{projectInfo.address}</span></span>
        </div>
        {projectInfo.floor_number && (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>Floor: <span className="font-medium">{projectInfo.floor_number}</span></span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Loader className="h-4 w-4 text-muted-foreground" />
          <span>Service Lift: <span className="font-medium">{projectInfo.service_lift_available ? 'Available' : 'Not Available'}</span></span>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
