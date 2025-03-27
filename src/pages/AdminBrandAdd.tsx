
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BrandService } from '@/services/BrandService';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  description: z.string().min(1, "Brand description is required"),
});

type FormValues = z.infer<typeof formSchema>;

const googleSheetFormSchema = z.object({
  sheet_url: z.string().url("Please enter a valid URL").min(1, "Sheet URL is required"),
  sheet_name: z.string().min(1, "Sheet name is required"),
  header_row: z.coerce.number().min(1, "Header row must be at least 1"),
});

type GoogleSheetFormValues = z.infer<typeof googleSheetFormSchema>;

const AdminBrandAdd = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("brand");
  const [brandId, setBrandId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const googleSheetForm = useForm<GoogleSheetFormValues>({
    resolver: zodResolver(googleSheetFormSchema),
    defaultValues: {
      sheet_url: "",
      sheet_name: "Sheet1",
      header_row: 1,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const newBrand = await BrandService.createBrand({
        name: values.name,
        description: values.description,
      });
      
      toast({
        title: "Brand created",
        description: "The brand has been created successfully",
      });
      
      // Set the brand ID for Google Sheet connection
      setBrandId(newBrand.id);
      
      // Move to Google Sheet tab if the brand was created successfully
      setCurrentTab("google-sheet");
    } catch (error: any) {
      console.error('Error creating brand:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create brand",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoogleSheetSubmit = async (values: GoogleSheetFormValues) => {
    if (!brandId) {
      toast({
        title: "Error",
        description: "Brand ID not found. Please create a brand first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await BrandService.updateGoogleSheetConnection(
        brandId,
        values.sheet_url,
        values.sheet_name,
        values.header_row
      );
      
      toast({
        title: "Google Sheet connected",
        description: "The Google Sheet has been connected successfully",
      });
      
      // Navigate back to the brands list
      navigate('/admin/brands');
    } catch (error: any) {
      console.error('Error connecting Google Sheet:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect Google Sheet",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipGoogleSheet = () => {
    navigate('/admin/brands');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin/brands')}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Add Brand</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Brand</CardTitle>
          <CardDescription>
            Add a new brand to the catalog and optionally connect it to a Google Sheet for product data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="brand" disabled={isSubmitting}>Brand Information</TabsTrigger>
              <TabsTrigger value="google-sheet" disabled={!brandId || isSubmitting}>Google Sheet</TabsTrigger>
            </TabsList>
            <TabsContent value="brand" className="pt-4">
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
                          The name of the brand as it will appear to users.
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
                          A brief description of the brand and its offerings.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Brand"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="google-sheet" className="pt-4">
              <Form {...googleSheetForm}>
                <form onSubmit={googleSheetForm.handleSubmit(onGoogleSheetSubmit)} className="space-y-6">
                  <FormField
                    control={googleSheetForm.control}
                    name="sheet_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Sheet URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://docs.google.com/spreadsheets/d/..." 
                          />
                        </FormControl>
                        <FormDescription>
                          The URL of the Google Sheet containing product data. Make sure the sheet is publicly accessible.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={googleSheetForm.control}
                      name="sheet_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sheet Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Sheet1" />
                          </FormControl>
                          <FormDescription>
                            The name of the sheet tab in the Google Sheet.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={googleSheetForm.control}
                      name="header_row"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Header Row</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min={1} 
                              placeholder="1" 
                            />
                          </FormControl>
                          <FormDescription>
                            The row number containing column headers.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={skipGoogleSheet}>
                      Skip
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect Sheet"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBrandAdd;
