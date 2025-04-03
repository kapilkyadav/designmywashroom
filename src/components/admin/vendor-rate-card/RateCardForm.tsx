
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Save } from 'lucide-react';
import { VendorItem, VendorRateCard } from '@/services/VendorRateCardService';
import { useRateCardForm } from './hooks/useRateCardForm';
import { ItemSelectField } from './components/ItemSelectField';
import { VendorRatesFields } from './components/VendorRatesFields';

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
  const form = useRateCardForm(defaultValues);

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ItemSelectField form={form} items={items} />
        <VendorRatesFields form={form} />

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
