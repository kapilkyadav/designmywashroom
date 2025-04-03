
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProjectsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const ProjectsTabs: React.FC<ProjectsTabsProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Projects</TabsTrigger>
        <TabsTrigger value="In Progress">In Progress</TabsTrigger>
        <TabsTrigger value="Quoted">Quoted</TabsTrigger>
        <TabsTrigger value="Finalized">Finalized</TabsTrigger>
        <TabsTrigger value="Completed">Completed</TabsTrigger>
        <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
      </TabsList>
      <TabsContent value={activeTab}>
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default ProjectsTabs;
