
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormValues } from '../hooks/useRateCardForm';

interface VendorRatesFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const VendorRatesFields: React.FC<VendorRatesFieldsProps> = ({ form }) => {
  return (
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
  );
};
