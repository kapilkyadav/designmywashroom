
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save } from 'lucide-react';
import { VendorItem, VendorRateCard } from '@/services/VendorRateCardService';

const formSchema = z.object({
  item_id: z.string({
    required_error: "Please select an item",
  }),
  vendor_rate1: z.coerce.number().nullable().optional(),
  vendor_rate2: z.coerce.number().nullable().optional(),
  vendor_rate3: z.coerce.number().nullable().optional(),
  client_rate: z.coerce.number({
    required_error: "Client rate is required",
    invalid_type_error: "Client rate must be a number",
  }),
  currency: z.string().default("INR").optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RateCardFormProps {
  defaultValues?: Partial<VendorRateCard>;
  items: VendorItem[];
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
}

const RateCardForm: React.FC<RateCardFormProps> = ({
  defaultValues,
  items,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_id: defaultValues?.item_id || '',
      vendor_rate1: defaultValues?.vendor_rate1 || null,
      vendor_rate2: defaultValues?.vendor_rate2 || null,
      vendor_rate3: defaultValues?.vendor_rate3 || null,
      client_rate: defaultValues?.client_rate || 0,
      currency: defaultValues?.currency || 'INR',
      notes: defaultValues?.notes || '',
    },
  });

  useEffect(() => {
    if (defaultValues && items.length > 0) {
      form.reset({
        item_id: defaultValues.item_id,
        vendor_rate1: defaultValues.vendor_rate1,
        vendor_rate2: defaultValues.vendor_rate2,
        vendor_rate3: defaultValues.vendor_rate3,
        client_rate: defaultValues.client_rate || 0,
        currency: defaultValues.currency || 'INR',
        notes: defaultValues.notes || '',
      });
    }
  }, [defaultValues, items, form]);

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="item_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.sl_no} - {item.scope_of_work} ({item.measuring_unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vendor_rate1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Rate 1</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={field.value ?? ''} 
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendor_rate2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Rate 2</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={field.value ?? ''} 
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendor_rate3"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Rate 3</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={field.value ?? ''} 
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Rate*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    required 
                    value={field.value ?? 0} 
                    onChange={(e) => field.onChange(Number(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="INR" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional information" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Rate Card
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default RateCardForm;
