
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RealProjectService } from '@/services/RealProjectService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Loader2, ArrowLeft, PenLine, Trash2, FileText, Download } from 'lucide-react';
import ProjectDetailsTab from '@/components/admin/real-projects/ProjectDetailsTab';
import CostingTab from '@/components/admin/real-projects/CostingTab';
import QuotationsTab from '@/components/admin/real-projects/QuotationsTab';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

const AdminRealProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: project, isLoading, isError, refetch } = useQuery({
    queryKey: ['real-project', id],
    queryFn: () => RealProjectService.getRealProject(id!),
    enabled: !!id
  });
  
  const handleDelete = async () => {
    if (!id) return;
    
    const success = await RealProjectService.deleteRealProject(id);
    if (success) {
      navigate('/admin/real-projects');
    }
    setIsDeleteDialogOpen(false);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'Quoted':
        return <Badge className="bg-amber-500">Quoted</Badge>;
      case 'Finalized':
        return <Badge className="bg-emerald-500">Finalized</Badge>;
      case 'Completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'Cancelled':
        return <Badge className="bg-destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (isError || !project) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Error loading project. The project may have been deleted or you don't have permission to view it.
          <div className="mt-4">
            <Button onClick={() => navigate('/admin/real-projects')}>
              Back to Projects
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost"
          onClick={() => navigate('/admin/real-projects')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Project
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between bg-card p-6 rounded-lg shadow-md gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.project_id}</h1>
          <p className="text-muted-foreground">{project.client_name}</p>
          <div className="mt-2">
            {getStatusBadge(project.status)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Created On:</span> 
            <span className="ml-2 font-medium">{format(new Date(project.created_at), 'dd MMM yyyy')}</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">Last Updated:</span> 
            <span className="ml-2 font-medium">{format(new Date(project.last_updated_at), 'dd MMM yyyy')}</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">Client Phone:</span> 
            <span className="ml-2 font-medium">{project.client_mobile}</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">Location:</span> 
            <span className="ml-2 font-medium">{project.client_location || 'Not specified'}</span>
          </div>
        </div>
      </div>
      
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
              <ProjectDetailsTab project={project} onUpdate={refetch} />
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
              <CostingTab project={project} onUpdate={refetch} />
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
              <QuotationsTab project={project} onUpdate={refetch} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and all associated quotations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRealProjectDetail;
