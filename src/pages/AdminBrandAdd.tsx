
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface BrandFormValues {
  name: string;
  description: string;
  connect_sheet: boolean;
  sheet_url?: string;
}

const AdminBrandAdd = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [connectSheet, setConnectSheet] = useState(false);
  
  const form = useForm<BrandFormValues>({
    defaultValues: {
      name: '',
      description: '',
      connect_sheet: false,
      sheet_url: '',
    }
  });

  const onSubmit = (data: BrandFormValues) => {
    // In a real app, this would be an API call
    console.log('Brand data to submit:', data);
    
    toast({
      title: "Brand created",
      description: `${data.name} has been successfully added.`,
    });
    
    navigate('/admin/brands');
  };

  const goToSheet = () => {
    if (form.getValues('name').trim() === '') {
      toast({
        title: "Required information missing",
        description: "Please enter a brand name first.",
        variant: "destructive",
      });
      return;
    }
    setActiveTab('sheet');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/brands')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Brand</h1>
          <p className="text-muted-foreground">
            Create a new brand and optionally connect a Google Sheet
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
          <CardDescription>
            Enter the details for the new brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Brand Details</TabsTrigger>
              <TabsTrigger value="sheet" disabled={!form.getValues('name')}>
                Google Sheet
              </TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <TabsContent value="details" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Brand name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Jaquar" {...field} />
                        </FormControl>
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
                            placeholder="Describe the brand"
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="connect_sheet"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              setConnectSheet(!!checked);
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Connect Google Sheet</FormLabel>
                          <FormDescription>
                            Connect a Google Sheet to import products for this brand
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => navigate('/admin/brands')}>
                      Cancel
                    </Button>
                    {connectSheet ? (
                      <Button type="button" onClick={goToSheet}>
                        Next: Configure Sheet
                      </Button>
                    ) : (
                      <Button type="submit">Create Brand</Button>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="sheet" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="sheet_url"
                    rules={{ 
                      required: connectSheet ? "Sheet URL is required" : false,
                      pattern: {
                        value: /https:\/\/docs\.google\.com\/spreadsheets\/.*/,
                        message: "Please enter a valid Google Sheets URL"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Sheet URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://docs.google.com/spreadsheets/d/..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the URL of your Google Sheet containing product data
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4 border rounded-md p-4">
                    <h3 className="font-medium">Sheet Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                      After adding the brand, you'll be able to:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Select which worksheet to use</li>
                      <li>Choose the header row</li>
                      <li>Map columns to product fields</li>
                      <li>Set up automatic daily sync</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('details')}>
                      Back
                    </Button>
                    <Button type="submit">Create Brand and Configure Sheet</Button>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBrandAdd;
