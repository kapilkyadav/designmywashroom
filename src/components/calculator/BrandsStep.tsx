
import React, { useState, useEffect } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Check } from 'lucide-react';

// Mock brands data (in a real app, this would come from an API)
const MOCK_BRANDS = [
  {
    id: 'jaquar',
    name: 'Jaquar',
    description: 'Premium bathroom solutions with cutting-edge technology',
    productCount: 235,
    logo: '⬢',
  },
  {
    id: 'kohler',
    name: 'Kohler',
    description: 'Luxury bathroom fixtures with innovative designs',
    productCount: 189,
    logo: '⬡',
  },
  {
    id: 'hindware',
    name: 'Hindware',
    description: 'Quality bathroom products with modern aesthetics',
    productCount: 156,
    logo: '◆',
  },
  {
    id: 'cera',
    name: 'Cera',
    description: 'Stylish and durable bathroom fittings',
    productCount: 142,
    logo: '◇',
  },
  {
    id: 'parryware',
    name: 'Parryware',
    description: 'Contemporary bathroom solutions',
    productCount: 128,
    logo: '■',
  },
  {
    id: 'grohe',
    name: 'Grohe',
    description: 'German engineering with premium quality',
    productCount: 112,
    logo: '□',
  },
];

const BrandsStep = () => {
  const { state, setBrand, nextStep, prevStep } = useCalculator();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBrands, setFilteredBrands] = useState(MOCK_BRANDS);
  
  // Filter brands based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBrands(MOCK_BRANDS);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = MOCK_BRANDS.filter(
      brand => 
        brand.name.toLowerCase().includes(lowercaseQuery) ||
        brand.description.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredBrands(filtered);
  }, [searchQuery]);
  
  // Select a brand
  const handleSelectBrand = (brandId: string) => {
    setBrand(brandId);
  };
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-semibold mb-2 text-center">Select a brand for your fixtures</h2>
      <p className="text-muted-foreground mb-8 text-center">Choose your preferred brand for quality fixtures in your washroom.</p>
      
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search for brands..."
            className="pl-10 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                isSelected={state.selectedBrand === brand.id}
                onSelect={() => handleSelectBrand(brand.id)}
              />
            ))
          ) : (
            <div className="col-span-2 p-8 text-center">
              <p className="text-muted-foreground">No brands found matching your search. Try different keywords.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
          >
            Back
          </Button>
          <Button 
            type="button" 
            onClick={nextStep}
            disabled={!state.selectedBrand}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

interface BrandCardProps {
  brand: {
    id: string;
    name: string;
    description: string;
    productCount: number;
    logo: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const BrandCard = ({ brand, isSelected, onSelect }: BrandCardProps) => {
  return (
    <Card
      className={cn(
        'border-2 cursor-pointer overflow-hidden transition-all duration-300',
        isSelected 
          ? 'border-primary ring-2 ring-primary/20' 
          : 'border-border hover:border-primary/30 hover:shadow-md'
      )}
      onClick={onSelect}
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "text-4xl",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}>
              {brand.logo}
            </div>
            <div>
              <h3 className="text-lg font-medium">{brand.name}</h3>
              <Badge variant="secondary" className="mt-1">
                {brand.productCount} products
              </Badge>
            </div>
          </div>
          
          {isSelected && (
            <div className="bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center animate-scale-in">
              <Check size={16} />
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm mt-3">
          {brand.description}
        </p>
        
        <div className="mt-4">
          <Button 
            variant={isSelected ? "default" : "outline"} 
            className="w-full"
            onClick={onSelect}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BrandsStep;
