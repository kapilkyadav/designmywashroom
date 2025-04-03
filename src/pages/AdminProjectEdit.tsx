import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { ProjectService } from '@/services/ProjectService';
import { Project } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, LoaderCircle } from 'lucide-react';

const AdminProjectEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_mobile: '',
    client_location: '',
    project_type: 'new-construction',
    length: 0,
    width: 0,
    height: 8, // Default height is 8ft
    timeline: 'standard',
    selected_brand: '',
    fixtures: {
      electrical: {
        ledMirror: false,
        exhaustFan: false,
        waterHeater: false
      },
      plumbing: {
        completePlumbing: false,
        fixtureInstallationOnly: false
      },
      additional: {
        showerPartition: false,
        vanity: false,
        bathtub: false,
        jacuzzi: false
      }
    }
  });

  useEffect(() => {
    if (!id) return;
    
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await ProjectService.getProjectById(id);
        setProject(data);
        
        // Initialize form data
        setFormData({
          client_name: data.client_name,
          client_email: data.client_email,
          client_mobile: data.client_mobile,
          client_location: data.client_location,
          project_type: data.project_type,
          length: data.length,
          width: data.width,
          height: data.height || 8, // Default to 8 if not specified
          timeline: data.timeline,
          selected_brand: data.selected_brand,
          fixtures: data.selected_fixtures || {
            electrical: {
              ledMirror: false,
              exhaustFan: false,
              waterHeater: false
            },
            plumbing: {
              completePlumbing: false,
              fixtureInstallationOnly: false
            },
            additional: {
              showerPartition: false,
              vanity: false,
              bathtub: false,
              jacuzzi: false
            }
          }
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFixtureChange = (category: 'electrical' | 'plumbing' | 'additional', name: string, checked: boolean) => {
    setFormData({
      ...formData,
      fixtures: {
        ...formData.fixtures,
        [category]: {
          ...formData.fixtures[category],
          [name]: checked
        }
      }
    });
  };

  const handleSave = async () => {
    if (!id || !project) return;
    
    try {
      setSaving(true);
      
      // Create update payload
      const updateData: Partial<Project> = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_mobile: formData.client_mobile,
        client_location: formData.client_location,
        project_type: formData.project_type as 'new-construction' | 'renovation',
        length: formData.length,
        width: formData.width,
        height: formData.height,
        timeline: formData.timeline as 'standard' | 'flexible',
        selected_brand: formData.selected_brand,
        selected_fixtures: formData.fixtures
      };
      
      // Update project
      await ProjectService.updateProject(id, updateData);
      
      toast({
        title: "Success",
        description: "Project has been updated",
      });
      
      // Navigate back to detail view
      navigate(`/admin/projects/detail/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/admin/projects/detail/${id}`)}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Project</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input 
                  id="client_name" 
                  name="client_name"
                  value={formData.client_name} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_email">Email</Label>
                <Input 
                  id="client_email" 
                  name="client_email"
                  type="email"
                  value={formData.client_email} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_mobile">Mobile</Label>
                <Input 
                  id="client_mobile" 
                  name="client_mobile"
                  value={formData.client_mobile} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_location">Location</Label>
                <Input 
                  id="client_location" 
                  name="client_location"
                  value={formData.client_location} 
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_type">Project Type</Label>
                <Select 
                  value={formData.project_type} 
                  onValueChange={(value) => handleSelectChange('project_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new-construction">New Construction</SelectItem>
                    <SelectItem value="renovation">Renovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="selected_brand">Selected Brand</Label>
                <Input 
                  id="selected_brand" 
                  name="selected_brand"
                  value={formData.selected_brand} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Select 
                  value={formData.timeline} 
                  onValueChange={(value) => handleSelectChange('timeline', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="font-medium">Dimensions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (ft)</Label>
                  <Input 
                    id="length" 
                    name="length"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.length.toString()} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (ft)</Label>
                  <Input 
                    id="width" 
                    name="width"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.width.toString()} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (ft)</Label>
                  <Input 
                    id="height" 
                    name="height"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.height.toString()} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fixtures */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Fixtures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Electrical Fixtures */}
              <div className="space-y-4">
                <h3 className="font-medium">Electrical Fixtures</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="ledMirror" 
                      checked={formData.fixtures.electrical.ledMirror}
                      onCheckedChange={(checked) => 
                        handleFixtureChange('electrical', 'ledMirror', checked as boolean)
                      }
                    />
                    <Label htmlFor="ledMirror" className="cursor-pointer">LED Mirror</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="exhaustFan" 
                      checked={formData.fixtures.electrical.exhaustFan}
                      onCheckedChange={(checked) => 
                        handleFixtureChange('electrical', 'exhaustFan', checked as boolean)
                      }
                    />
                    <Label htmlFor="exhaustFan" className="cursor-pointer">Exhaust Fan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="waterHeater" 
                      checked={formData.fixtures.electrical.waterHeater}
                      onCheckedChange={(checked) => 
                        handleFixtureChange('electrical', 'waterHeater', checked as boolean)
                      }
                    />
                    <Label htmlFor="waterHeater" className="cursor-pointer">Water Heater</Label>
                  </div>
                </div>
              </div>

              {/* Plumbing Fixtures */}
              <div className="space-y-4">
                <h3 className="font-medium">Plumbing Fixtures</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="completePlumbing" 
                      checked={formData.fixtures.plumbing.completePlumbing}
                      onCheckedChange={(checked) => 
                        handleFixtureChange('plumbing', 'completePlumbing', checked as boolean)
                      }
                    />
                    <Label htmlFor="completePlumbing" className="cursor-pointer">Complete Plumbing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="fixtureInstallationOnly" 
                      checked={formData.fixtures.plumbing.fixtureInstallationOnly}
                      onCheckedChange={(checked) => 
                        handleFixtureChange('plumbing', 'fixtureInstallationOnly', checked as boolean)
                      }
                    />
                    <Label htmlFor="fixtureInstallationOnly" className="cursor-pointer">Fixture Installation Only</Label>
                  </div>
                </div>
              </div>

              {/* Additional Fixtures */}
              <div className="space-y-4">
                <h3 className="font-medium">Additional Fixtures</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="showerPartition" 
                      checked={formData.fixtures.additional.showerPartition}
                      onCheckedChange={(checked) => 
                        handleFixtureChange('additional', 'showerPartition', checked as boolean)
                      }
                    />
                    <Label htmlFor="showerPartition" className="cursor-pointer">Shower Partition</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="vanity" 
                      checked={formData.fixtures.additional.vanity}
                      onCheckedChange={(checked) => 
                        handleFixtureChange('additional', 'vanity', checked as boolean)
                      }
                    />
                    <Label htmlFor="vanity" className="cursor-pointer">Vanity</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bathtub" 
                      checked={formData.fixtures.additional.bathtub}
                      onCheckedChange={(checked) => 
                        handleFixtureChange('additional', 'bathtub', checked as boolean)
                      }
                    />
                    <Label htmlFor="bathtub" className="cursor-pointer">Bathtub</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="jacuzzi" 
                      checked={formData.fixtures.additional.jacuzzi}
                      onCheckedChange={(checked) => 
                        handleFixtureChange('additional', 'jacuzzi', checked as boolean)
                      }
                    />
                    <Label htmlFor="jacuzzi" className="cursor-pointer">Jacuzzi</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectEdit;
