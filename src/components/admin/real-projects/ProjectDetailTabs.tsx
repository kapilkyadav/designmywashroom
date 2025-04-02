
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RealProject } from '@/services/RealProjectService';
import ProjectDetailsTab from '@/components/admin/real-projects/ProjectDetailsTab';
import CostingTab from '@/components/admin/real-projects/CostingTab';
import QuotationsTab from '@/components/admin/real-projects/QuotationsTab';

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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="details">Project Details</TabsTrigger>
        <TabsTrigger value="costing">Costing & Rates</TabsTrigger>
        <TabsTrigger value="quotations">Quotations</TabsTrigger>
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
      
      <TabsContent value="costing">
        <Card>
          <CardHeader>
            <CardTitle>Costing & Rates</CardTitle>
            <CardDescription>Manage project costs, execution rates and additional fees</CardDescription>
          </CardHeader>
          <CardContent>
            <CostingTab project={project} onUpdate={onUpdate} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="quotations">
        <Card>
          <CardHeader>
            <CardTitle>Quotations</CardTitle>
            <CardDescription>Generate and manage client quotations</CardDescription>
          </CardHeader>
          <CardContent>
            <QuotationsTab project={project} onUpdate={onUpdate} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProjectDetailTabs;
