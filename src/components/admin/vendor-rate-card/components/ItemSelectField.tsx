
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VendorItem } from '@/services/VendorRateCardService';
import { FormValues } from '../hooks/useRateCardForm';

interface ItemSelectFieldProps {
  form: UseFormReturn<FormValues>;
  items: VendorItem[];
}

export const ItemSelectField: React.FC<ItemSelectFieldProps> = ({ form, items }) => {
  return (
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
  );
};
