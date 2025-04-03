
import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectInfoValues } from '../ProjectCreateWizard';
import { BrandService } from '@/services/BrandService';
import { Brand } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface ProjectInfoStepProps {
  form: UseFormReturn<ProjectInfoValues>;
  onSubmit: (data: ProjectInfoValues) => void;
}

const ProjectInfoStep: React.FC<ProjectInfoStepProps> = ({ form, onSubmit }) => {
  // Fetch brands for dropdown
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: BrandService.getAllBrands,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="client_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter client name" />
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
                <FormLabel>Mobile Number*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter mobile number" />
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter email address" />
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
                <FormLabel>Location/City*</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter location/city" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Address*</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Enter complete address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <FormField
            control={form.control}
            name="project_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Type*</FormLabel>
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
                <FormLabel>Preferred Brand</FormLabel>
                <Select
                  value={field.value || "none"}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None Selected</SelectItem>
                    {brands.map((brand: Brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="pt-4 flex justify-end">
          <Button type="submit">
            Next Step
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectInfoStep;
