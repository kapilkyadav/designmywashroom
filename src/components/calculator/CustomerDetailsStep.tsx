import React, { useState } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const CustomerDetailsStep = () => {
  const { state, setCustomerDetails, prevStep, calculateEstimate } = useCalculator();
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [formState, setFormState] = useState({
    name: state.customerDetails.name || '',
    email: state.customerDetails.email || '',
    mobile: state.customerDetails.mobile || '',
    location: state.customerDetails.location || '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    mobile: '',
    location: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
    
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      mobile: '',
      location: '',
    };
    
    let isValid = true;
    
    if (!formState.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!formState.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(formState.mobile.replace(/[^0-9]/g, ''))) {
      newErrors.mobile = 'Please enter a valid 10-digit Indian mobile number';
      isValid = false;
    }
    
    if (!formState.location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsCalculating(true);
        setCustomerDetails(formState);
        await calculateEstimate();
        
        toast({
          title: "Estimate calculated successfully!",
          description: "Your washroom design estimate is ready to view.",
        });
      } catch (error: any) {
        console.error('Error calculating estimate:', error);
        toast({
          title: "Error calculating estimate",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive"
        });
      } finally {
        setIsCalculating(false);
      }
    }
  };
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center">Your Contact Information</h2>
      <p className="text-muted-foreground mb-8 text-center">
        Please provide your details to receive your personalized washroom estimate.
      </p>
      
      <Card className="max-w-xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name" className="text-base">
              Full Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              className={`mt-1 ${errors.name ? 'border-destructive focus:ring-destructive' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email" className="text-base">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleInputChange}
              className={`mt-1 ${errors.email ? 'border-destructive focus:ring-destructive' : ''}`}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="mobile" className="text-base">
              Mobile Number
            </Label>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              value={formState.mobile}
              onChange={handleInputChange}
              className={`mt-1 ${errors.mobile ? 'border-destructive focus:ring-destructive' : ''}`}
              placeholder="10-digit mobile number"
            />
            {errors.mobile && (
              <p className="text-destructive text-sm mt-1">{errors.mobile}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="location" className="text-base">
              Location
            </Label>
            <Input
              id="location"
              name="location"
              value={formState.location}
              onChange={handleInputChange}
              className={`mt-1 ${errors.location ? 'border-destructive focus:ring-destructive' : ''}`}
              placeholder="City, State"
            />
            {errors.location && (
              <p className="text-destructive text-sm mt-1">{errors.location}</p>
            )}
          </div>
          
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-4">
              By submitting this form, you agree to our <a href="/terms" className="underline hover:text-foreground">Terms of Service</a> and <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>. Your information will be used to provide you with the requested services and updates.
            </p>
            
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isCalculating}
              >
                Back
              </Button>
              <Button type="submit" disabled={isCalculating}>
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate Estimate"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CustomerDetailsStep;
