
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectInfoValues, WashroomWithAreas } from '../types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BrandService } from '@/services/BrandService';
import { ProductService } from '@/services/ProductService';
import { Product } from '@/lib/supabase';
import { VendorRateCardService } from '@/services/VendorRateCardService';

// Import the extracted components
import ClientInformation from './components/ClientInformation';
import ProjectDetails from './components/ProjectDetails';
import WashroomList from './components/WashroomList';
import ProductList from './components/ProductList';
import SummaryFooter from './components/SummaryFooter';

interface SummaryStepProps {
  projectInfo: ProjectInfoValues;
  washrooms: WashroomWithAreas[];
}

const SummaryStep: React.FC<SummaryStepProps> = ({ projectInfo, washrooms }) => {
  const [brandName, setBrandName] = useState<string>("");
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch brand name and products for the selected brand
  useEffect(() => {
    const fetchBrandData = async () => {
      setLoading(true);
      try {
        if (projectInfo.selected_brand) {
          // Get brand name
          const brand = await BrandService.getBrandById(projectInfo.selected_brand);
          setBrandName(brand.name);
          
          // Get products for this brand
          const brandProducts = await ProductService.getProductsByBrandId(projectInfo.selected_brand);
          setProducts(brandProducts);
        }
      } catch (error) {
        console.error('Error fetching brand data:', error);
      }
      setLoading(false);
    };

    fetchBrandData();
  }, [projectInfo.selected_brand]);
  
  // Fetch service names for all service IDs across all washrooms
  useEffect(() => {
    const fetchServiceNames = async () => {
      try {
        // Collect all unique service IDs from all washrooms
        const serviceIds = new Set<string>();
        washrooms.forEach(washroom => {
          if (washroom.services) {
            Object.entries(washroom.services)
              .filter(([_, isSelected]) => isSelected)
              .forEach(([serviceId]) => {
                serviceIds.add(serviceId);
              });
          }
        });
        
        if (serviceIds.size === 0) return;
        
        // Fetch vendor items for these IDs
        const items = await VendorRateCardService.getItemsByIds(Array.from(serviceIds));
        
        // Create a mapping of ID to service name
        const namesMap: Record<string, string> = {};
        items.forEach(item => {
          namesMap[item.id] = item.scope_of_work;
        });
        
        setServiceNames(namesMap);
      } catch (error) {
        console.error('Error fetching service names:', error);
      }
    };
    
    fetchServiceNames();
  }, [washrooms]);

  // Count total selected services across all washrooms
  const countSelectedServices = () => {
    let count = 0;
    washrooms.forEach(washroom => {
      if (washroom.services) {
        count += Object.values(washroom.services).filter(Boolean).length;
      }
    });
    return count;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Summary</h3>
        <Badge variant="outline">Ready to create</Badge>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Client Information Section */}
            <ClientInformation clientInfo={projectInfo} />
            
            <Separator />
            
            {/* Project Details Section */}
            <ProjectDetails projectInfo={projectInfo} brandName={brandName} />
            
            <Separator />
            
            {/* Washrooms List Section */}
            <WashroomList washrooms={washrooms} serviceNames={serviceNames} />
            
            {projectInfo.selected_brand && (
              <>
                <Separator />
                
                {/* Products List Section */}
                <ProductList 
                  brandName={brandName} 
                  products={products} 
                  loading={loading} 
                />
              </>
            )}
          </div>
          
          {/* Summary Footer */}
          <SummaryFooter 
            washroomCount={washrooms.length} 
            serviceCount={countSelectedServices()} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryStep;
