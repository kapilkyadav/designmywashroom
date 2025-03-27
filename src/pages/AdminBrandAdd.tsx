
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from '@/hooks/use-toast';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Save } from 'lucide-react';
import { BrandService } from '@/services/BrandService';
import BrandSheetMapping from '@/components/admin/BrandSheetMapping';

const formSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AdminBrandAdd = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'brand' | 'sheet'>('brand');
  const [brandId, setBrandId] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      const brandData = {
        name: values.name,
        description: values.description || '',
      };
      
      const brand = await BrandService.createBrand(brandData);
      setBrandId(brand.id);
      
      toast({
        title: "Brand created",
        description: "Brand has been successfully created"
      });
      
      setCurrentStep('sheet');
    } catch (error: any) {
      console.error('Error creating brand:', error);
      toast({
        title: "Error",
        description: error.message || "Could not create brand",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSheetComplete = () => {
    navigate('/admin/brands');
  };

  const handleSkipSheet = () => {
    navigate('/admin/brands');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/brands')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Add New Brand</h1>
      </div>

      {currentStep === 'brand' ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Brand Information</CardTitle>
            <CardDescription>
              Enter the details of the new brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter brand name" />
                      </FormControl>
                      <FormDescription>
                        The name of the brand as it will appear to clients
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter brand description" 
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        A short description of the brand and its products
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save & Continue
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium">Import Products from Google Sheet</h2>
              <p className="text-muted-foreground">
                Connect your brand to a Google Sheet to import and sync products
              </p>
            </div>
            <Button variant="outline" onClick={handleSkipSheet}>
              Skip for now
            </Button>
          </div>
          
          <BrandSheetMapping brandId={brandId} onComplete={handleSheetComplete} />
        </div>
      )}
    </div>
  );
};

export default AdminBrandAdd;
