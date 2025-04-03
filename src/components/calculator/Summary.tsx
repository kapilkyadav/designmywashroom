
import React, { useState, useEffect } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Check, Download, Share2 } from 'lucide-react';
import { BrandService } from '@/services/BrandService';
import { FixtureService } from '@/services/FixtureService'; 
import { Fixture } from '@/lib/supabase';

const Summary = () => {
  const { state, resetCalculator } = useCalculator();
  const [brandName, setBrandName] = useState('');
  const [fixtures, setFixtures] = useState<{
    electrical: Fixture[];
    plumbing: Fixture[];
    additional: Fixture[];
  }>({
    electrical: [],
    plumbing: [],
    additional: []
  });

  // Fetch brand name on component mount
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        if (state.selectedBrand) {
          const brand = await BrandService.getBrandById(state.selectedBrand);
          setBrandName(brand.name);
        }
      } catch (error) {
        console.error('Error fetching brand:', error);
        setBrandName('Selected Brand');
      }
    };
    
    fetchBrand();
  }, [state.selectedBrand]);
  
  // Fetch fixtures data
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const electrical = await FixtureService.getFixturesByCategory('electrical');
        const plumbing = await FixtureService.getFixturesByCategory('plumbing');
        const additional = await FixtureService.getFixturesByCategory('additional');
        
        setFixtures({
          electrical,
          plumbing,
          additional
        });
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      }
    };
    
    fetchFixtures();
  }, []);

  // Function to format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF or other document
    toast({
      title: "Estimate downloaded",
      description: "Your estimate has been downloaded successfully.",
    });
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    toast({
      title: "Share link copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const handleContactDesigner = () => {
    // In a real app, this would trigger a contact form or call
    toast({
      title: "Request sent",
      description: "A designer will contact you shortly.",
    });
  };

  // Helper to find fixture name from fixture key
  const getFixtureName = (category: 'electrical' | 'plumbing' | 'additional', fixtureKey: string): string => {
    const fixtureList = fixtures[category];
    if (!fixtureList.length) return formatFixtureKey(fixtureKey);
    
    const fixture = fixtureList.find(f => 
      f.name.toLowerCase().includes(fixtureKey.toLowerCase())
    );
    
    return fixture ? fixture.name : formatFixtureKey(fixtureKey);
  };
  
  // Format fixture key as fallback
  const formatFixtureKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  // Helper to determine which fixtures were selected
  const getSelectedFixtures = () => {
    const selected = [];
    
    // Electrical fixtures
    if (state.fixtures.electrical.ledMirror) 
      selected.push(getFixtureName('electrical', 'ledMirror'));
    if (state.fixtures.electrical.exhaustFan) 
      selected.push(getFixtureName('electrical', 'exhaustFan'));
    if (state.fixtures.electrical.waterHeater) 
      selected.push(getFixtureName('electrical', 'waterHeater'));
    
    // Plumbing fixtures
    if (state.fixtures.plumbing.completePlumbing) 
      selected.push(getFixtureName('plumbing', 'completePlumbing'));
    if (state.fixtures.plumbing.fixtureInstallationOnly) 
      selected.push(getFixtureName('plumbing', 'fixtureInstallationOnly'));
    
    // Additional fixtures
    if (state.fixtures.additional.showerPartition) 
      selected.push(getFixtureName('additional', 'showerPartition'));
    if (state.fixtures.additional.vanity) 
      selected.push(getFixtureName('additional', 'vanity'));
    if (state.fixtures.additional.bathtub) 
      selected.push(getFixtureName('additional', 'bathtub'));
    if (state.fixtures.additional.jacuzzi) 
      selected.push(getFixtureName('additional', 'jacuzzi'));
    
    // Always add other execution charges
    const otherExecutionCharges = fixtures.additional.find(
      f => f.name.toLowerCase().includes('other execution charges')
    );
    if (otherExecutionCharges) {
      selected.push(otherExecutionCharges.name);
    }
    
    return selected;
  };

  // Ensure dimensions are properly displayed by using the actual values from state
  console.log("Summary dimensions:", state.dimensions);
  
  // Get dimensions and ensure they're valid numbers
  const length = typeof state.dimensions.length === 'number' ? state.dimensions.length : 0;
  const width = typeof state.dimensions.width === 'number' ? state.dimensions.width : 0;
  
  // Calculate areas based on dimensions
  const floorArea = length * width;
  const wallHeight = 9; // Fixed at 9 feet
  const wallArea = 2 * (length + width) * wallHeight;

  console.log("Summary calculated areas:", { length, width, floorArea, wallArea });
  console.log("Estimate details:", state.estimate);

  return (
    <div className="animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your Washroom Estimate is Ready!</h2>
          <p className="text-muted-foreground">
            Thank you, {state.customerDetails.name}! Here's a detailed breakdown of your custom washroom design estimate.
          </p>
        </div>

        <Card className="mb-8 overflow-hidden">
          <div className="bg-primary p-6 text-primary-foreground">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">Total Estimate</h3>
                <p className="text-primary-foreground/80 text-sm">
                  {state.projectType === 'new-construction' ? 'New Construction' : 'Renovation'} • {state.timeline === 'standard' ? 'Standard Timeline (4 weeks)' : 'Flexible Timeline'}
                </p>
              </div>
              <div className="text-3xl font-bold mt-3 md:mt-0">{formatCurrency(state.estimate.total)}</div>
            </div>
          </div>
          
          <div className="p-6">
            <h4 className="text-lg font-medium mb-4">Project Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-2">Washroom Dimensions</h5>
                <p className="text-base">
                  {length} × {width} × 9 feet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Floor Area: {floorArea.toFixed(2)} sq ft
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Wall Area: {wallArea.toFixed(2)} sq ft
                </p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-2">Selected Brand</h5>
                <p className="text-base">
                  {brandName || 'Custom Selection'}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <h5 className="text-sm font-medium text-muted-foreground mb-2">Selected Fixtures</h5>
                <div className="flex flex-wrap gap-2">
                  {getSelectedFixtures().map((fixture, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {fixture}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <h4 className="text-lg font-medium mb-4">Cost Breakdown</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fixture Cost</span>
                <span className="font-medium">{formatCurrency(state.estimate.fixtureCost)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plumbing Work</span>
                <span className="font-medium">{formatCurrency(state.estimate.plumbingCost)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tiling Work</span>
                <span className="font-medium">{formatCurrency(state.estimate.tilingCost.total)}</span>
              </div>
              
              {/* Always show product cost row, even if it's zero */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{brandName || 'Brand'} Products</span>
                <span className="font-medium">{formatCurrency(state.estimate.productCost)}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Estimate</span>
                <span>{formatCurrency(state.estimate.total)}</span>
              </div>
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-4 mt-6">
              <h4 className="text-sm font-medium mb-2">Note</h4>
              <p className="text-sm text-muted-foreground">
                This estimate is valid for 30 days. Actual costs may vary based on site conditions and final material selections. A detailed quotation will be provided after an on-site assessment.
              </p>
            </div>
          </div>
        </Card>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Button className="flex-1" variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Estimate
          </Button>
          <Button className="flex-1" variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Estimate
          </Button>
          <Button className="flex-1" onClick={handleContactDesigner}>
            Contact Designer
          </Button>
        </div>
        
        <div className="text-center">
          <Button variant="link" onClick={resetCalculator}>
            Start a New Estimate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Summary;
