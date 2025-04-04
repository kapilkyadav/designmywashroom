
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';
import { RealProjectService } from '@/services/real-projects';
import { toast } from '@/hooks/use-toast';
import { Washroom } from '@/services/real-projects/types';
import { Edit, Layout } from 'lucide-react';
import LayoutDesignerDialog from './LayoutDesignerDialog';

const WashroomsTab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [washrooms, setWashrooms] = useState<Washroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWashroom, setSelectedWashroom] = useState<Washroom | null>(null);
  const [layoutDialogOpen, setLayoutDialogOpen] = useState(false);

  const fetchWashrooms = async () => {
    try {
      setLoading(true);
      if (!id) return;
      const data = await RealProjectService.getProjectWashrooms(id);
      setWashrooms(data);
    } catch (error) {
      console.error("Error fetching washrooms:", error);
      toast({
        title: "Error",
        description: "Failed to load washrooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWashrooms();
  }, [id]);

  const openLayoutDesigner = (washroom: Washroom) => {
    setSelectedWashroom(washroom);
    setLayoutDialogOpen(true);
  };

  const closeLayoutDesigner = () => {
    setLayoutDialogOpen(false);
  };

  const handleLayoutSaved = () => {
    fetchWashrooms();
    toast({
      title: "Success",
      description: "Washroom layout saved successfully",
    });
    closeLayoutDesigner();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Washrooms</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : washrooms.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No washrooms found for this project.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {washrooms.map((washroom) => (
            <Card key={washroom.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{washroom.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openLayoutDesigner(washroom)}
                    >
                      <Layout className="h-4 w-4 mr-1" />
                      Layout
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {washroom.length}' × {washroom.width}' × {washroom.height}'
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Floor Area:</span>
                    <span>{washroom.length * washroom.width} sq ft</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Wall Area:</span>
                    <span>{washroom.wall_area || 0} sq ft</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ceiling Area:</span>
                    <span>{washroom.ceiling_area || 0} sq ft</span>
                  </div>
                  
                  {washroom.service_details?.layout && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm font-medium">Layout Available</p>
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(washroom.service_details.layout.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {washroom.service_details.layout.items.length} items in layout
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {selectedWashroom && (
        <LayoutDesignerDialog
          isOpen={layoutDialogOpen}
          onClose={closeLayoutDesigner}
          washroom={selectedWashroom}
          projectId={id || ''}
          onLayoutSaved={handleLayoutSaved}
        />
      )}
    </div>
  );
};

export default WashroomsTab;
