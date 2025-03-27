
import React, { useEffect, useState } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BrandService } from '@/services/BrandService';
import { Brand } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const BrandsStep = () => {
  const { state, setBrand, nextStep, prevStep } = useCalculator();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        const brandsData = await BrandService.getAllBrands();
        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching brands:', error);
        toast({
          title: "Error",
          description: "Could not load brands. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleContinue = () => {
    if (!state.selectedBrand) {
      toast({
        title: "Brand selection required",
        description: "Please select a brand to continue.",
        variant: "destructive",
      });
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Brand</h2>
        <p className="text-gray-500">Choose your preferred brand for your washroom fixtures.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : brands.length > 0 ? (
        <RadioGroup value={state.selectedBrand} onValueChange={setBrand} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <Card key={brand.id} className={`cursor-pointer ${state.selectedBrand === brand.id ? 'border-2 border-primary' : ''}`}>
              <CardContent className="p-4 flex items-center space-x-4">
                <RadioGroupItem value={brand.id} id={brand.id} />
                <Label htmlFor={brand.id} className="flex-1 cursor-pointer">
                  <div className="font-medium">{brand.name}</div>
                  <div className="text-sm text-gray-500">{brand.description}</div>
                </Label>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No brands available. Please check back later.</p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default BrandsStep;
