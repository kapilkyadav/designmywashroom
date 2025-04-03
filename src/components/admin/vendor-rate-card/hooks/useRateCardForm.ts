
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { VendorRateCard } from '@/services/VendorRateCardService';

export const formSchema = z.object({
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

export type FormValues = z.infer<typeof formSchema>;

export const useRateCardForm = (defaultValues?: Partial<VendorRateCard>) => {
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

  return form;
};
