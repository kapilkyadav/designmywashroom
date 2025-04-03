
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RealProject, RealProjectService } from '@/services/RealProjectService';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import ProjectAddressInfo from './ProjectAddressInfo';

interface ProjectDetailsTabProps {
  project: RealProject;
  onUpdate: () => void;
}

// Define form schema
const formSchema = z.object({
  client_name: z.string().min(2, "Client name is required"),
  client_email: z.string().email().optional().or(z.literal('')),
  client_mobile: z.string().min(10, "Valid mobile number required"),
  client_location: z.string().min(1, "Location is required"),
  project_type: z.string().min(1, "Project type is required"),
  selected_brand: z.string().optional().or(z.literal('')),
  address: z.string().min(5, "Full address is required"),
  floor_number: z.string().optional().or(z.literal('')),
  service_lift_available: z.boolean().optional(),
  length: z.string().optional().or(z.literal('')),
  width: z.string().optional().or(z.literal('')),
  height: z.string().optional().or(z.literal('')),
  status: z.string().min(1, "Status is required"),
  internal_notes: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

const ProjectDetailsTab: React.FC<ProjectDetailsTabProps> = ({ project, onUpdate }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: project.client_name,
      client_email: project.client_email || '',
      client_mobile: project.client_mobile,
      client_location: project.client_location || '',
      project_type: project.project_type,
      selected_brand: project.selected_brand || '',
      address: project.project_details?.address || '',
      floor_number: project.project_details?.floor_number || '',
      service_lift_available: project.project_details?.service_lift_available || false,
      length: project.length?.toString() || '',
      width: project.width?.toString() || '',
      height: project.height?.toString() || '',
      status: project.status,
      internal_notes: project.internal_notes || '',
    }
  });
  
  const { isSubmitting } = form.formState;
  
  const onSubmit = async (data: FormValues) => {
    // Convert numeric string values to numbers
    const updatedData = {
      ...data,
      length: data.length ? parseFloat(data.length) : null,
      width: data.width ? parseFloat(data.width) : null,
      height: data.height ? parseFloat(data.height) : null,
      project_details: {
        ...project.project_details,
        address: data.address,
        floor_number: data.floor_number || null,
        service_lift_available: data.service_lift_available || false,
      },
    };
    
    // Remove fields that aren't directly in the project table
    const { address, floor_number, service_lift_available, ...projectData } = updatedData;
    
    const success = await RealProjectService.updateRealProject(project.id, projectData);
    
    if (success) {
      onUpdate();
    }
  };
  
  const statusOptions = [
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Quoted', value: 'Quoted' },
    { label: 'Finalized', value: 'Finalized' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-none bg-muted/40">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Client Information</h3>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="client_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="client_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="client_mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="client_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-none bg-muted/40">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Project Information</h3>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="project_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new-construction">New Construction</SelectItem>
                          <SelectItem value="renovation">Renovation</SelectItem>
                          <SelectItem value="Not Specified">Not Specified</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="selected_brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selected Brand</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Status</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-none bg-muted/40">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Project Address</h3>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Enter complete address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="floor_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor Number (if applicable)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="E.g., Ground, 1, 2, etc." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="service_lift_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Service Lift Available</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <div>
            <FormField
              control={form.control}
              name="internal_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={7} {...field} placeholder="Add internal notes about this project..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectDetailsTab;
