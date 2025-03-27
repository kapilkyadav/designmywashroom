
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Fixture } from '@/lib/supabase';
import { Loader2, Save } from 'lucide-react';

// Form schema validation
const fixtureSchema = z.object({
  name: z.string().min(1, "Fixture name is required"),
  category: z.string().min(1, "Category is required"),
  mrp: z.coerce.number().min(0, "MRP must be a positive number"),
  landing_price: z.coerce.number().min(0, "Landing price must be a positive number"),
  client_price: z.coerce.number().min(0, "Client price must be a positive number"),
  quotation_price: z.coerce.number().min(0, "Quotation price must be a positive number"),
});

type FixtureFormValues = z.infer<typeof fixtureSchema>;

interface FixtureFormProps {
  fixture?: Fixture;
  onSubmit: (data: FixtureFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const FixtureForm: React.FC<FixtureFormProps> = ({
  fixture,
  onSubmit,
  isSubmitting
}) => {
  // Initialize the form with existing fixture data or defaults
  const form = useForm<FixtureFormValues>({
    resolver: zodResolver(fixtureSchema),
    defaultValues: {
      name: fixture?.name || "",
      category: fixture?.category || "electrical",
      mrp: fixture?.mrp || 0,
      landing_price: fixture?.landing_price || 0,
      client_price: fixture?.client_price || 0,
      quotation_price: fixture?.quotation_price || 0,
    },
  });
  
  // Watch landing_price and quotation_price to calculate margin
  const landingPrice = form.watch("landing_price");
  const quotationPrice = form.watch("quotation_price");
  
  // Calculate margin
  const calculateMargin = () => {
    if (landingPrice <= 0) return 0;
    const margin = ((quotationPrice - landingPrice) / landingPrice) * 100;
    return isNaN(margin) ? 0 : margin;
  };
  
  const margin = calculateMargin();
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fixture Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter fixture name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="additional">Additional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="mrp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MRP (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="landing_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Landing Price (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="client_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Price (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quotation_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quotation Price (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-6">
              <FormLabel>Calculated Margin</FormLabel>
              <div className={`text-2xl font-bold ${margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                {margin.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Based on landing price and quotation price
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Fixture
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FixtureForm;
