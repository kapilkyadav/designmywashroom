
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProjectService } from '@/services/ProjectService';
import { BrandService } from '@/services/BrandService';
import { Project } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowLeft, Edit, Trash2, Calendar, LoaderCircle, 
  Ruler, Home, Clock, Bath, ShowerHead, Zap 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandName, setBrandName] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await ProjectService.getProjectById(id);
        setProject(data);
        
        // Fetch brand name if there's a selected brand
        if (data.selected_brand) {
          try {
            const brandData = await BrandService.getBrandById(data.selected_brand);
            setBrandName(brandData.name);
          } catch (error) {
            console.error('Error fetching brand details:', error);
            setBrandName("Unknown Brand");
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await ProjectService.deleteProject(id);
      toast({
        title: "Success",
        description: "Project has been deleted",
      });
      navigate('/admin/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or has been deleted.</p>
        <Button onClick={() => navigate('/admin/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  // Process the selected fixtures
  const selectedFixtures = project.selected_fixtures || {};
  
  // Helper function to check if a fixture is selected
  const isFixtureSelected = (category: string, name: string) => {
    return selectedFixtures[category]?.[name] === true;
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/projects')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Project Details</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/admin/projects/edit/${id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-muted-foreground">Client Information</h3>
                <p className="text-lg font-semibold">{project.client_name}</p>
                <p>{project.client_email}</p>
                <p>{project.client_mobile}</p>
                <p>{project.client_location}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-muted-foreground">Project Type</h3>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <p className="capitalize">{project.project_type.replace('-', ' ')}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-muted-foreground">Timeline</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <p className="capitalize">{project.timeline}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-muted-foreground">Dimensions</h3>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  <p>{project.length} × {project.width} ft (Height: {project.height} ft)</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total Area: {(project.length * project.width).toFixed(2)} sq.ft
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-muted-foreground">Selected Brand</h3>
                <p>{brandName || "None"}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-muted-foreground">Created</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <p>{new Date(project.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Fixtures */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Fixtures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-2">Electrical Fixtures</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className={isFixtureSelected('electrical', 'ledMirror') ? "text-primary" : "text-muted-foreground"}>
                    LED Mirror: {isFixtureSelected('electrical', 'ledMirror') ? "Yes" : "No"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={isFixtureSelected('electrical', 'exhaustFan') ? "text-primary" : "text-muted-foreground"}>
                    Exhaust Fan: {isFixtureSelected('electrical', 'exhaustFan') ? "Yes" : "No"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={isFixtureSelected('electrical', 'waterHeater') ? "text-primary" : "text-muted-foreground"}>
                    Water Heater: {isFixtureSelected('electrical', 'waterHeater') ? "Yes" : "No"}
                  </span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Plumbing Fixtures</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className={isFixtureSelected('plumbing', 'completePlumbing') ? "text-primary" : "text-muted-foreground"}>
                    Complete Plumbing: {isFixtureSelected('plumbing', 'completePlumbing') ? "Yes" : "No"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={isFixtureSelected('plumbing', 'fixtureInstallationOnly') ? "text-primary" : "text-muted-foreground"}>
                    Fixture Installation Only: {isFixtureSelected('plumbing', 'fixtureInstallationOnly') ? "Yes" : "No"}
                  </span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Additional Fixtures</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className={isFixtureSelected('additional', 'showerPartition') ? "text-primary" : "text-muted-foreground"}>
                    Shower Partition: {isFixtureSelected('additional', 'showerPartition') ? "Yes" : "No"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={isFixtureSelected('additional', 'vanity') ? "text-primary" : "text-muted-foreground"}>
                    Vanity: {isFixtureSelected('additional', 'vanity') ? "Yes" : "No"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={isFixtureSelected('additional', 'bathtub') ? "text-primary" : "text-muted-foreground"}>
                    Bathtub: {isFixtureSelected('additional', 'bathtub') ? "Yes" : "No"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className={isFixtureSelected('additional', 'jacuzzi') ? "text-primary" : "text-muted-foreground"}>
                    Jacuzzi: {isFixtureSelected('additional', 'jacuzzi') ? "Yes" : "No"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Estimation Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-muted-foreground mb-2">Fixture Cost</h3>
                <p className="text-xl font-semibold">{formatCurrency(project.fixture_cost)}</p>
              </div>
              <div>
                <h3 className="text-muted-foreground mb-2">Plumbing Cost</h3>
                <p className="text-xl font-semibold">{formatCurrency(project.plumbing_cost)}</p>
              </div>
              <div>
                <h3 className="text-muted-foreground mb-2">Tiling Cost</h3>
                <p className="text-xl font-semibold">{formatCurrency(project.tiling_cost)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <h3 className="text-lg font-semibold">Final Estimate</h3>
              <p className="text-2xl font-bold text-primary">{formatCurrency(project.final_estimate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project and all of its data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProjectDetail;
