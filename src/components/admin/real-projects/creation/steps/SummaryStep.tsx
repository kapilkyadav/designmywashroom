
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectInfoValues, WashroomWithAreas } from '../types';
import { Badge } from '@/components/ui/badge';
import { HomeIcon, User, Phone, Mail, MapPin, Building, Loader, Ruler, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { BrandService } from '@/services/BrandService';
import { ProductService } from '@/services/ProductService';
import { Product } from '@/lib/supabase';
import { VendorRateCardService } from '@/services/VendorRateCardService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SummaryStepProps {
  projectInfo: ProjectInfoValues;
  washrooms: WashroomWithAreas[];
}

const SummaryStep: React.FC<SummaryStepProps> = ({ projectInfo, washrooms }) => {
  const [brandName, setBrandName] = useState<string>("");
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});
  const [serviceCategoryMap, setServiceCategoryMap] = useState<Record<string, string>>({});
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
        
        // Create a mapping of ID to service name and category
        const namesMap: Record<string, string> = {};
        const categoryMap: Record<string, string> = {};
        
        items.forEach(item => {
          namesMap[item.id] = item.scope_of_work;
          categoryMap[item.id] = item.category?.name || "Uncategorized";
        });
        
        setServiceNames(namesMap);
        setServiceCategoryMap(categoryMap);
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

  // Group services by category for better display
  const getServicesGroupedByCategory = (washroomIndex: number) => {
    const washroom = washrooms[washroomIndex];
    if (!washroom?.services) return {};
    
    const groupedServices: Record<string, string[]> = {};
    
    Object.entries(washroom.services)
      .filter(([_, isSelected]) => isSelected)
      .forEach(([serviceId]) => {
        const category = serviceCategoryMap[serviceId] || "Uncategorized";
        if (!groupedServices[category]) {
          groupedServices[category] = [];
        }
        groupedServices[category].push(serviceNames[serviceId] || serviceId);
      });
    
    return groupedServices;
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
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Client Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{projectInfo.client_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{projectInfo.client_mobile}</span>
                </div>
                {projectInfo.client_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{projectInfo.client_email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{projectInfo.client_location}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Project Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Project Type: <span className="font-medium">{projectInfo.project_type}</span></span>
                </div>
                {brandName && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Brand: <span className="font-medium">{brandName}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Address: <span className="font-medium">{projectInfo.address}</span></span>
                </div>
                {projectInfo.floor_number && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Floor: <span className="font-medium">{projectInfo.floor_number}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Loader className="h-4 w-4 text-muted-foreground" />
                  <span>Service Lift: <span className="font-medium">{projectInfo.service_lift_available ? 'Available' : 'Not Available'}</span></span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex justify-between mb-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Washrooms</h4>
                <Badge variant="secondary">{washrooms.length} washroom(s)</Badge>
              </div>
              
              <div className="space-y-4">
                {washrooms.map((washroom, index) => {
                  const groupedServices = getServicesGroupedByCategory(index);
                  
                  return (
                    <div key={index} className="border rounded-md p-3">
                      <h5 className="font-semibold mb-2">{washroom.name}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <span className="text-xs text-muted-foreground block">Dimensions</span>
                          <div className="flex items-center gap-1">
                            <Ruler className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {washroom.length}' × {washroom.width}' × {washroom.height}'
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Floor Area</span>
                          <span className="text-sm">{washroom.floorArea.toFixed(2)} sq. ft.</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">Wall Area</span>
                          <span className="text-sm">{washroom.wallArea.toFixed(2)} sq. ft.</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Services Selected</span>
                        {Object.keys(groupedServices).length > 0 ? (
                          <div className="space-y-2">
                            {Object.entries(groupedServices).map(([category, services]) => (
                              <div key={category} className="border-l-2 border-primary/30 pl-2">
                                <p className="text-xs font-medium">{category}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {services.map((serviceName, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {serviceName}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">No services selected</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {projectInfo.selected_brand && (
              <>
                <Separator />
                
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm font-semibold text-muted-foreground">{brandName} Products</h4>
                    </div>
                    <Badge variant="secondary">{products.length} product(s)</Badge>
                  </div>
                  
                  <div className="overflow-auto max-h-64 border rounded-md">
                    <Table>
                      <TableHeader className="bg-muted">
                        <TableRow>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="text-xs">Category</TableHead>
                          <TableHead className="text-xs text-right">MRP</TableHead>
                          <TableHead className="text-xs text-right">YDS Offer Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y">
                        {products.length > 0 ? (
                          products.slice(0, 10).map((product) => (
                            <TableRow key={product.id} className="hover:bg-muted/50">
                              <TableCell className="text-sm py-2">{product.name}</TableCell>
                              <TableCell className="text-sm py-2">{product.category || '-'}</TableCell>
                              <TableCell className="text-sm py-2 text-right">₹{product.mrp.toLocaleString('en-IN')}</TableCell>
                              <TableCell className="text-sm py-2 text-right">₹{product.client_price.toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                              {loading ? "Loading products..." : "No products available for this brand"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    {products.length > 10 && (
                      <div className="p-2 text-center text-xs text-muted-foreground">
                        Showing 10 of {products.length} products
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-6 bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              You are about to create a new project with {washrooms.length} washroom(s) and {countSelectedServices()} service(s).
              Click "Create Project" to continue.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryStep;
