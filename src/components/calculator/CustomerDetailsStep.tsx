
import React, { useState, useEffect } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [generalError, setGeneralError] = useState('');
  
  useEffect(() => {
    if (state.customerDetails.name || state.customerDetails.email) {
      setFormData({
        name: state.customerDetails.name || '',
        email: state.customerDetails.email || '',
        mobile: state.customerDetails.mobile || '',
        location: state.customerDetails.location || ''
      });
    }
  }, [state.customerDetails]);
  
  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      mobile: '',
      location: ''
    };
    let isValid = true;
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/[^0-9]/g, ''))) {
      newErrors.mobile = 'Mobile number should have 10 digits';
      isValid = false;
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the field error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error when user makes any change
    if (generalError) {
      setGeneralError('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      console.log(`Processing form submission for email: ${formData.email.trim()}`);
      
      const customerDetails = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        location: formData.location.trim()
      };
      
      console.log("Saving customer details:", customerDetails);
      
      // First, update the customer details
      setCustomerDetails(customerDetails);
      
      // Small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Try to calculate the estimate
        console.log("About to calculate estimate with customer details:", customerDetails);
        const calculationResult = await calculateEstimate();
        console.log("Estimate calculated successfully:", calculationResult);
        
        // Move to the next step
        nextStep();
      } catch (error: any) {
        console.error('Error calculating estimate:', error);
        
        // Check the specific type of error for better user feedback
        if (error.message === 'MISSING_CUSTOMER_DETAILS') {
          setGeneralError("Please provide your name and email to continue.");
          toast.error("Missing information", {
            description: "Please provide your name and email to continue."
          });
        } else if (error.message === 'MISSING_BRAND_SELECTION') {
          setGeneralError("Please select a brand to continue.");
          toast.error("Missing brand selection", {
            description: "Please select a brand to continue."
          });
          // Go back to the brand selection step
          prevStep();
        } else if (error.message === 'MISSING_LOCATION') {
          setGeneralError("Please provide your location to continue.");
          toast.error("Missing location", {
            description: "Please provide your location to continue."
          });
        } else if (error.message === 'MISSING_MOBILE_NUMBER') {
          setGeneralError("Please provide your mobile number to continue.");
          toast.error("Missing mobile number", {
            description: "Please provide your mobile number to continue."
          });
        } else if (error.message === 'RATE_LIMITED') {
          setGeneralError("Too many submissions. Please wait a moment before submitting again.");
          toast.error("Too many submissions", {
            description: "Please wait a moment before submitting again."
          });
        } else {
          setGeneralError("There was an unexpected error. Please try again.");
          toast.error("Error calculating estimate", {
            description: "There was an unexpected error. Please try again."
          });
        }
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      setGeneralError("Unable to process your request. Please try again later.");
      toast.error("Error submitting form", {
        description: "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center">Enter Your Contact Details</h2>
      <p className="text-muted-foreground mb-6 text-center">
        Provide your contact information to receive your washroom estimate.
      </p>
      
      {generalError && (
        <Alert variant="destructive" className="mb-6 max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}
      
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
