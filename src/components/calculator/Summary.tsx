
import React, { useState, useEffect } from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BrandService } from '@/services/BrandService';
import { FixtureService } from '@/services/FixtureService'; 
import { Fixture } from '@/lib/supabase';
import { Toaster } from 'sonner';

// Import component parts
import SummaryHeader from './summary/SummaryHeader';
import ProjectDimensions from './summary/ProjectDimensions';
import SelectedBrand from './summary/SelectedBrand';
import SelectedFixtures from './summary/SelectedFixtures';
import CostBreakdown from './summary/CostBreakdown';
import EstimateNote from './summary/EstimateNote';
import EstimateActions from './summary/EstimateActions';
import EstimateHeader from './summary/EstimateHeader';

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
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <SummaryHeader customerName={state.customerDetails.name} />

        <Card className="mb-8 overflow-hidden">
          <EstimateHeader 
            projectType={state.projectType} 
            timeline={state.timeline} 
            total={state.estimate.total} 
          />
          
          <div className="p-6">
            <h4 className="text-lg font-medium mb-4">Project Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProjectDimensions 
                length={length} 
                width={width} 
                floorArea={floorArea} 
                wallArea={wallArea} 
              />
              
              <SelectedBrand brandName={brandName} />
              
              <SelectedFixtures 
                fixtures={fixtures} 
                selectedFixtures={state.fixtures} 
              />
            </div>
            
            <Separator className="my-6" />
            
            <h4 className="text-lg font-medium mb-4">Cost Breakdown</h4>
            
            <CostBreakdown 
              estimate={state.estimate}
              brandName={brandName} 
            />
            
            <EstimateNote />
          </div>
        </Card>
        
        <EstimateActions resetCalculator={resetCalculator} />
      </div>
    </div>
  );
};

export default Summary;
