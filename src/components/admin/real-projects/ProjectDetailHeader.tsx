
import React, { useState, useEffect } from 'react';
import { RealProject } from '@/services/RealProjectService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Trash2,
  FileEdit,
  Building
} from 'lucide-react';
import ProjectAddressInfo from './ProjectAddressInfo';
import { BrandService } from '@/services/BrandService';

interface ProjectDetailHeaderProps {
  project: RealProject;
  onDeleteClick: () => void;
}

const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({ 
  project, 
  onDeleteClick 
}) => {
  const [brandName, setBrandName] = useState<string>("");

  // Fetch brand name when component loads
  useEffect(() => {
    const fetchBrandName = async () => {
      if (project.selected_brand) {
        try {
          const brand = await BrandService.getBrandById(project.selected_brand);
          setBrandName(brand.name);
        } catch (error) {
          console.error('Error fetching brand name:', error);
          setBrandName("Unknown Brand");
        }
      }
    };

    fetchBrandName();
  }, [project.selected_brand]);

  // Status badge color based on status
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Quoted': return 'bg-amber-100 text-amber-800';
      case 'Finalized': return 'bg-violet-100 text-violet-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format dates nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Extract address info
  const address = project.project_details?.address;
  
  // Calculate washroom count
  const washroomCount = project.washrooms?.length || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.project_id}</h1>
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Created on {formatDate(project.created_at)} • Last updated {formatDate(project.last_updated_at)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={onDeleteClick}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Client Information */}
            <div className="space-y-3">
              <h3 className="font-medium">Client Information</h3>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{project.client_name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{project.client_mobile}</span>
              </div>
              
              {project.client_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{project.client_email}</span>
                </div>
              )}
              
              {project.client_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{project.client_location}</span>
                </div>
              )}
            </div>
            
            {/* Project Information */}
            <div className="space-y-3">
              <h3 className="font-medium">Project Details</h3>
              
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>Type: {project.project_type}</span>
              </div>
              
              {project.selected_brand && (
                <div className="flex items-center gap-2">
                  <FileEdit className="h-4 w-4 text-muted-foreground" />
                  <span>Brand: {brandName || "Loading..."}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {washroomCount} Washroom{washroomCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {/* Address Information */}
            <div className="space-y-3">
              <h3 className="font-medium">Location</h3>
              
              {address ? (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <span className="line-clamp-3">{address}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>No address information</span>
                </div>
              )}

              {project.project_details?.floor_number && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>Floor: {project.project_details.floor_number}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Service Lift: {project.project_details?.service_lift_available ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetailHeader;
