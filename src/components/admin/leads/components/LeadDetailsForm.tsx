
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Lead } from '@/services/LeadService';

interface LeadDetailsFormProps {
  formData: Partial<Lead>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (date: Date | undefined, fieldName: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isUpdating: boolean;
  onCancel: () => void;
}

const LeadDetailsForm: React.FC<LeadDetailsFormProps> = ({
  formData,
  handleChange,
  handleSelectChange,
  handleDateChange,
  handleSubmit,
  isUpdating,
  onCancel
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer_name">Customer Name</Label>
          <Input 
            id="customer_name"
            name="customer_name"
            value={formData.customer_name || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="budget_preference">Budget Preference</Label>
          <Select
            value={formData.budget_preference || 'not_specified'}
            onValueChange={(value) => handleSelectChange('budget_preference', value)}
          >
            <SelectTrigger className="z-10">
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background">
              <SelectItem value="not_specified">Not Specified</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status || 'New'}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger className="z-10">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background">
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="next_followup_date">Next Follow-up Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal z-10",
                  !formData.next_followup_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.next_followup_date ? (
                  format(new Date(formData.next_followup_date), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50 bg-background">
              <Calendar
                mode="single"
                selected={formData.next_followup_date ? new Date(formData.next_followup_date) : undefined}
                onSelect={(date) => handleDateChange(date, 'next_followup_date')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lead_date">Lead Date</Label>
          <Input
            id="lead_date"
            name="lead_date"
            value={formData.lead_date ? format(new Date(formData.lead_date), 'yyyy-MM-dd') : ''}
            readOnly
            className="bg-gray-100"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="remarks">Notes</Label>
        <Textarea 
          id="remarks"
          name="remarks"
          rows={4}
          value={formData.remarks || ''}
          onChange={handleChange}
          placeholder="Add notes about this lead..."
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        
        <Button 
          type="submit" 
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default LeadDetailsForm;
