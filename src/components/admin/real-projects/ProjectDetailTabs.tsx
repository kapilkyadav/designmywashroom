import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RealProject, RealProjectService } from '@/services/RealProjectService';
import ProjectDetailsTab from '@/components/admin/real-projects/ProjectDetailsTab';
import CostingTab from '@/components/admin/real-projects/costing/CostingTab';
import WashroomsTab from '@/components/admin/real-projects/washrooms/WashroomsTab';
import ExecutionTab from '@/components/admin/real-projects/costing/ExecutionTab';
import { useQuery } from '@tanstack/react-query';

interface ProjectDetailTabsProps {
  project: RealProject;
  onUpdate: () => void;
  defaultTab?: string;
}

const ProjectDetailTabs: React.FC<ProjectDetailTabsProps> = ({ 
  project, 
  onUpdate,
  defaultTab = "details" 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!project) {
      setIsLoading(true);
      return;
    }
    setIsLoading(false);
  }, [project]);

  const { data: services = [] } = useQuery({
    queryKey: ['execution-services'],
    queryFn: () => RealProjectService.getExecutionServices(),
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="details">Project Details</TabsTrigger>
        <TabsTrigger value="washrooms">Washrooms</TabsTrigger>
        <TabsTrigger value="execution">Execution Services</TabsTrigger>
        <TabsTrigger value="costing">Vendor Rates</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>View and update project and client information</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectDetailsTab project={project} onUpdate={onUpdate} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="washrooms">
        <Card>
          <CardHeader>
            <CardTitle>Project Washrooms</CardTitle>
            <CardDescription>Manage washroom details and dimensions</CardDescription>
          </CardHeader>
          <CardContent>
            <WashroomsTab project={project} services={services} onUpdate={onUpdate} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="execution">
        <Card>
          <CardHeader>
            <CardTitle>Execution Services</CardTitle>
            <CardDescription>Manage execution costs and services</CardDescription>
          </CardHeader>
          <CardContent>
            <ExecutionTab project={project} onUpdate={onUpdate} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="costing">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Rates</CardTitle>
            <CardDescription>Manage vendor rates and additional costs</CardDescription>
          </CardHeader>
          <CardContent>
            <CostingTab project={project} onUpdate={onUpdate} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProjectDetailTabs;