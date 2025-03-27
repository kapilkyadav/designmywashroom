
import React, { useState } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ProjectService } from '@/services/ProjectService';

const CustomerDetailsStep = () => {
  const { state, setCustomerDetails, calculateEstimate, prevStep, nextStep } = useCalculator();
  const [formData, setFormData] = useState({
    name: state.customerDetails.name || '',
    email: state.customerDetails.email || '',
    mobile: state.customerDetails.mobile || '',
    location: state.customerDetails.location || ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    mobile: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      mobile: '',
      location: ''
    };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/[^0-9]/g, ''))) {
      newErrors.mobile = 'Mobile number should have 10 digits';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    setErrors(newErrors);
    
    // Return true if there are no errors
    return !Object.values(newErrors).some(error => error);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Check for rate limiting before processing
      const isRateLimited = ProjectService.isRateLimited(formData.email.trim());
      if (isRateLimited) {
        toast({
          title: "Too many submissions",
          description: "Please wait a moment before submitting again.",
          variant: "destructive"
        });
        return;
      }
      
      // Make sure we're sending non-empty strings to avoid "N/A" in the admin panel
      const customerDetails = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        location: formData.location.trim()
      };
      
      // Log the details being saved for debugging
      console.log("Saving customer details:", customerDetails);
      
      // Update context with customer details
      setCustomerDetails(customerDetails);
      
      // Calculate estimate and save to database
      await calculateEstimate();
      
      // Important: Move to the next step after successful calculation
      nextStep();
      
      toast({
        title: "Estimate calculated successfully",
        description: "Your washroom renovation estimate is ready.",
      });
      
    } catch (error) {
      console.error('Error submitting details:', error);
      
      // Check if error is rate limiting
      if (error instanceof Error && error.message === 'RATE_LIMITED') {
        toast({
          title: "Too many submissions",
          description: "Please wait a moment before submitting again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error calculating estimate",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center">Enter Your Contact Details</h2>
      <p className="text-muted-foreground mb-8 text-center">
        Provide your contact information to receive your washroom estimate.
      </p>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-base">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 text-base h-12 ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email" className="text-base">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 text-base h-12 ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="mobile" className="text-base">Mobile Number</Label>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleChange}
              className={`mt-1 text-base h-12 ${errors.mobile ? 'border-destructive' : ''}`}
            />
            {errors.mobile && (
              <p className="text-destructive text-sm mt-1">{errors.mobile}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="location" className="text-base">Location</Label>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="Enter your location"
              value={formData.location}
              onChange={handleChange}
              className={`mt-1 text-base h-12 ${errors.location ? 'border-destructive' : ''}`}
            />
            {errors.location && (
              <p className="text-destructive text-sm mt-1">{errors.location}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating Estimate...
              </>
            ) : (
              'Get Your Estimate'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerDetailsStep;
