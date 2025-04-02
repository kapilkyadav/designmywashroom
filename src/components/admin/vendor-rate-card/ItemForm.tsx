
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
import { VendorCategory, VendorItem } from '@/services/VendorRateCardService';

const formSchema = z.object({
  category_id: z.string({
    required_error: "Please select a category",
  }),
  sl_no: z.string().min(1, {
    message: 'Serial number is required',
  }),
  item_code: z.string().min(1, {
    message: 'Item code is required',
  }),
  scope_of_work: z.string().min(2, {
    message: 'Scope of work must be at least 2 characters',
  }),
  measuring_unit: z.string().min(1, {
    message: 'Measuring unit is required',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ItemFormProps {
  defaultValues?: Partial<VendorItem>;
  categories: VendorCategory[];
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({
  defaultValues,
  categories,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: defaultValues?.category_id || '',
      sl_no: defaultValues?.sl_no || '',
      item_code: defaultValues?.item_code || '',
      scope_of_work: defaultValues?.scope_of_work || '',
      measuring_unit: defaultValues?.measuring_unit || '',
    },
  });

  useEffect(() => {
    if (defaultValues && categories.length > 0) {
      form.reset({
        category_id: defaultValues.category_id,
        sl_no: defaultValues.sl_no,
        item_code: defaultValues.item_code,
        scope_of_work: defaultValues.scope_of_work,
        measuring_unit: defaultValues.measuring_unit,
      });
    }
  }, [defaultValues, categories, form]);

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sl_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SL No</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 1A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="item_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g. PLMB-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scope_of_work"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope of Work</FormLabel>
              <FormControl>
                <Textarea placeholder="Detailed description of work" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="measuring_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Measuring Unit</FormLabel>
              <FormControl>
                <Input placeholder="e.g. SFT, Nos, etc." {...field} />
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
              Save Item
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ItemForm;
