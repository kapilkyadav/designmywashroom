
import React, { useState, useEffect } from 'react';
import { useCalculator } from '@/hooks/calculator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Brand } from '@/lib/supabase';
import { BrandService } from '@/services/BrandService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const BrandSelectionStep = () => {
  const { state, setBrand, nextStep, prevStep } = useCalculator();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const data = await BrandService.getAllBrands();
        setBrands(data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrands();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center">Select Your Preferred Brand</h2>
      <p className="text-muted-foreground mb-8 text-center">
        Choose a brand for the fixtures and products in your washroom.
      </p>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-base">Brand</Label>
              <Select 
                value={state.selectedBrand} 
                onValueChange={setBrand}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {brands.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No brands found. Please contact support.
                </p>
              )}
            </div>
            
            {state.selectedBrand && (
              <div className="border rounded-lg p-4 bg-secondary/30">
                <h3 className="font-medium mb-2">
                  {brands.find(b => b.id === state.selectedBrand)?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {brands.find(b => b.id === state.selectedBrand)?.description || 'No description available'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Products: {brands.find(b => b.id === state.selectedBrand)?.product_count || 0}
                </p>
              </div>
            )}
          </>
        )}
        
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
          >
            Back
          </Button>
          <Button 
            type="submit"
            disabled={!state.selectedBrand || loading}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BrandSelectionStep;
