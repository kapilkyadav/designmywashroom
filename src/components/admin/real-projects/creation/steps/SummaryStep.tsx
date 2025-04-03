
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectInfoValues, WashroomWithAreas } from '../types';
import { Badge } from '@/components/ui/badge';
import { HomeIcon, User, Phone, Mail, MapPin, Building, Loader, Ruler } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SummaryStepProps {
  projectInfo: ProjectInfoValues;
  washrooms: WashroomWithAreas[];
}

const SummaryStep: React.FC<SummaryStepProps> = ({ projectInfo, washrooms }) => {
  // Count total selected services across all washrooms
  const countSelectedServices = () => {
    let count = 0;
    washrooms.forEach(washroom => {
      if (washroom.services) {
        count += Object.values(washroom.services).filter(Boolean).length;
      }
    });
    return count;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Summary</h3>
        <Badge variant="outline">Ready to create</Badge>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Client Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{projectInfo.client_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{projectInfo.client_mobile}</span>
                </div>
                {projectInfo.client_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{projectInfo.client_email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{projectInfo.client_location}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Project Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Project Type: <span className="font-medium">{projectInfo.project_type}</span></span>
                </div>
                {projectInfo.selected_brand && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Brand: <span className="font-medium">{projectInfo.selected_brand}</span></span>
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
            
            <Separator />
            
            <div>
              <div className="flex justify-between mb-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Washrooms</h4>
                <Badge variant="secondary">{washrooms.length} washroom(s)</Badge>
              </div>
              
              <div className="space-y-4">
                {washrooms.map((washroom, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <h5 className="font-semibold mb-2">{washroom.name}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">Dimensions</span>
                        <div className="flex items-center gap-1">
                          <Ruler className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {washroom.length}' × {washroom.width}' × {washroom.height}'
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Floor Area</span>
                        <span className="text-sm">{washroom.floorArea.toFixed(2)} sq. ft.</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Wall Area</span>
                        <span className="text-sm">{washroom.wallArea.toFixed(2)} sq. ft.</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Services Selected</span>
                      <div className="flex flex-wrap gap-1">
                        {washroom.services && Object.keys(washroom.services).filter(key => washroom.services[key]).length > 0 ? (
                          Object.entries(washroom.services)
                            .filter(([_, isSelected]) => isSelected)
                            .map(([serviceId]) => (
                              <Badge key={serviceId} variant="outline" className="text-xs">
                                {serviceId}
                              </Badge>
                            ))
                        ) : (
                          <span className="text-xs italic text-muted-foreground">No services selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              You are about to create a new project with {washrooms.length} washroom(s) and {countSelectedServices()} service(s).
              Click "Create Project" to continue.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryStep;
