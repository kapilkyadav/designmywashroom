
import React, { useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text } from 'react-konva';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Download, ZoomIn, ZoomOut, Trash2, Plus, MousePointer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WashroomFixture, useWashroomLayoutManager } from './hooks/useWashroomLayoutManager';
import FixtureLibrary from './FixtureLibrary';

const WashroomLayoutDesigner = () => {
  const [dimensions, setDimensions] = useState({
    length: 10,
    width: 8,
    height: 9,
  });

  const {
    scale,
    fixtures,
    selectedFixtureId,
    zoomIn,
    zoomOut,
    addFixture,
    removeFixture,
    selectFixture,
    updateFixturePosition,
    exportToImage,
    resetLayout,
  } = useWashroomLayoutManager(dimensions);

  const handleDimensionChange = (dimension: keyof typeof dimensions, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setDimensions(prev => ({
        ...prev,
        [dimension]: numValue
      }));
    }
  };

  const [activeTab, setActiveTab] = useState('designer');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Washroom Layout Designer</h1>
      </div>
      
      <Tabs defaultValue="designer" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="designer">Designer</TabsTrigger>
          <TabsTrigger value="fixtures">Fixtures Library</TabsTrigger>
        </TabsList>
        
        <TabsContent value="designer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Washroom Dimensions</CardTitle>
              <CardDescription>
                Enter the dimensions of the washroom in feet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (ft)</Label>
                  <Input 
                    id="length" 
                    type="number" 
                    min="1" 
                    step="0.1" 
                    value={dimensions.length}
                    onChange={(e) => handleDimensionChange('length', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (ft)</Label>
                  <Input 
                    id="width" 
                    type="number" 
                    min="1" 
                    step="0.1" 
                    value={dimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (ft)</Label>
                  <Input 
                    id="height" 
                    type="number" 
                    min="1" 
                    step="0.1" 
                    value={dimensions.height}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="w-full lg:w-3/4">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Washroom Layout</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={zoomIn}>
                      <ZoomIn className="h-4 w-4 mr-1" />
                      Zoom In
                    </Button>
                    <Button variant="outline" size="sm" onClick={zoomOut}>
                      <ZoomOut className="h-4 w-4 mr-1" />
                      Zoom Out
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportToImage}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetLayout}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="overflow-auto">
                  <div
                    id="layout-container"
                    className="border rounded-md bg-gray-50 dark:bg-gray-900 overflow-hidden"
                    style={{ width: '100%', height: '600px' }}
                  >
                    <Stage 
                      width={800} 
                      height={600}
                      scale={{ x: scale, y: scale }}
                      draggable
                    >
                      <Layer>
                        {/* Background */}
                        <Rect
                          x={0}
                          y={0}
                          width={dimensions.length * 50}
                          height={dimensions.width * 50}
                          fill="#f5f5f5"
                          stroke="#333"
                          strokeWidth={2}
                        />
                        
                        {/* Grid lines */}
                        {Array.from({ length: Math.floor(dimensions.length) + 1 }).map((_, i) => (
                          <Line
                            key={`vertical-${i}`}
                            points={[i * 50, 0, i * 50, dimensions.width * 50]}
                            stroke="#ddd"
                            strokeWidth={1}
                            dash={[5, 5]}
                          />
                        ))}
                        
                        {Array.from({ length: Math.floor(dimensions.width) + 1 }).map((_, i) => (
                          <Line
                            key={`horizontal-${i}`}
                            points={[0, i * 50, dimensions.length * 50, i * 50]}
                            stroke="#ddd"
                            strokeWidth={1}
                            dash={[5, 5]}
                          />
                        ))}
                        
                        {/* Fixtures */}
                        {fixtures.map(fixture => (
                          <React.Fragment key={fixture.id}>
                            <Rect
                              x={fixture.x}
                              y={fixture.y}
                              width={fixture.width}
                              height={fixture.height}
                              fill={fixture.id === selectedFixtureId ? "#9fd3e6" : "#ccc"}
                              stroke={fixture.id === selectedFixtureId ? "#007bff" : "#999"}
                              strokeWidth={2}
                              draggable
                              onClick={() => selectFixture(fixture.id)}
                              onDragEnd={(e) => {
                                updateFixturePosition(fixture.id, e.target.x(), e.target.y());
                              }}
                            />
                            <Text
                              x={fixture.x + 5}
                              y={fixture.y + fixture.height / 2 - 7}
                              text={fixture.name}
                              fontSize={12}
                              fill="#333"
                            />
                          </React.Fragment>
                        ))}
                      </Layer>
                    </Stage>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full lg:w-1/4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Current Fixtures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('fixtures')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Fixture
                    </Button>
                    
                    {fixtures.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4">
                        No fixtures added yet. Click "Add Fixture" to begin.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {fixtures.map(fixture => (
                          <div 
                            key={fixture.id}
                            className={`p-2 border rounded flex justify-between items-center cursor-pointer ${
                              fixture.id === selectedFixtureId ? 'bg-primary/10 border-primary' : ''
                            }`}
                            onClick={() => selectFixture(fixture.id)}
                          >
                            <div>
                              <div className="font-medium">{fixture.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {fixture.width / 50}ft x {fixture.height / 50}ft
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFixture(fixture.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="fixtures">
          <FixtureLibrary 
            onSelectFixture={(fixture) => {
              addFixture(fixture);
              setActiveTab('designer');
              toast({
                title: "Fixture Added",
                description: `${fixture.name} has been added to your layout.`,
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WashroomLayoutDesigner;
