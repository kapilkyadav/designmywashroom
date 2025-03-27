
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SettingsService } from '@/services/SettingsService';
import { Settings } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
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

const formSchema = z.object({
  plumbing_rate_per_sqft: z.coerce.number().positive("Rate must be positive"),
  tile_cost_per_unit: z.coerce.number().positive("Cost must be positive"),
  tiling_labor_per_sqft: z.coerce.number().positive("Rate must be positive"),
  breakage_percentage: z.coerce.number().min(0, "Percentage must be at least 0").max(100, "Percentage must not exceed 100"),
});

type FormValues = z.infer<typeof formSchema>;

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plumbing_rate_per_sqft: 150,
      tile_cost_per_unit: 80,
      tiling_labor_per_sqft: 85,
      breakage_percentage: 10,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const settings = await SettingsService.getSettings();
      
      // Update form with fetched settings
      form.reset({
        plumbing_rate_per_sqft: settings.plumbing_rate_per_sqft,
        tile_cost_per_unit: settings.tile_cost_per_unit,
        tiling_labor_per_sqft: settings.tiling_labor_per_sqft,
        breakage_percentage: settings.breakage_percentage,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      await SettingsService.updateSettings(values);
      
      toast({
        title: "Settings updated",
        description: "The settings have been updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Calculation Settings</CardTitle>
          <CardDescription>
            Configure the default pricing and calculation parameters for the washroom calculator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="plumbing_rate_per_sqft"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plumbing Rate (per sq. ft.)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2.5">₹</span>
                          <Input {...field} type="number" min="0" className="pl-7" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Cost of plumbing work per square foot.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tile_cost_per_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tile Cost (per unit)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2.5">₹</span>
                          <Input {...field} type="number" min="0" className="pl-7" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Cost of a single 2x2 tile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tiling_labor_per_sqft"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiling Labor (per sq. ft.)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2.5">₹</span>
                          <Input {...field} type="number" min="0" className="pl-7" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Labor cost for tiling per square foot.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="breakage_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breakage Percentage</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} type="number" min="0" max="100" />
                          <span className="absolute right-2.5 top-2.5">%</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Extra tiles to account for breakage.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
