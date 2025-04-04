
import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Circle, Text } from 'react-konva';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Download, ZoomIn, ZoomOut, Save, Trash2 } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Washroom } from '@/services/real-projects/types';
import { useWashroomLayoutManager } from './hooks/useWashroomLayoutManager';

interface WashroomLayoutDesignerProps {
  washroom: Washroom;
  onSave?: (layoutData: any) => void;
}

const fixtureTypes = [
  { id: 'toilet', name: 'Toilet', color: '#D1E5F7', width: 1.5, height: 2 },
  { id: 'sink', name: 'Sink', color: '#E6F7FF', width: 1.5, height: 1 },
  { id: 'shower', name: 'Shower', color: '#E3F2FD', width: 2.5, height: 2.5 },
  { id: 'bathtub', name: 'Bathtub', color: '#BBDEFB', width: 5, height: 2.5 },
  { id: 'door', name: 'Door', color: '#DCEDC8', width: 2.5, height: 0.3 },
  { id: 'window', name: 'Window', color: '#F0F4C3', width: 3, height: 0.3 },
];

// Form schema for fixture addition
const fixtureFormSchema = z.object({
  type: z.string().min(1, { message: "Please select a fixture type" }),
  positionX: z.number().min(0, { message: "X position must be positive" }),
  positionY: z.number().min(0, { message: "Y position must be positive" }),
  rotation: z.number().default(0)
});

const WashroomLayoutDesigner: React.FC<WashroomLayoutDesignerProps> = ({ 
  washroom,
  onSave 
}) => {
  const { 
    layoutItems,
    addFixture,
    removeFixture,
    saveLayout,
    stageRef,
    scale,
    zoomIn,
    zoomOut,
    downloadImage
  } = useWashroomLayoutManager(washroom);

  // Form handling
  const form = useForm<z.infer<typeof fixtureFormSchema>>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: {
      type: fixtureTypes[0].id,
      positionX: 1,
      positionY: 1,
      rotation: 0
    },
  });

  const handleSubmit = (values: z.infer<typeof fixtureFormSchema>) => {
    const selectedType = fixtureTypes.find(type => type.id === values.type);
    if (!selectedType) return;

    addFixture({
      id: `${values.type}-${Date.now()}`,
      type: values.type,
      name: selectedType.name,
      x: values.positionX,
      y: values.positionY,
      width: selectedType.width,
      height: selectedType.height,
      color: selectedType.color,
      rotation: values.rotation
    });

    toast({
      title: "Fixture added",
      description: `Added ${selectedType.name} to the layout`,
    });
  };

  const handleSave = () => {
    const savedData = saveLayout();
    if (onSave) {
      onSave(savedData);
    }
    toast({
      title: "Layout saved",
      description: "Washroom layout has been saved successfully",
    });
  };

  // Calculate canvas size based on washroom dimensions with some padding
  const SCALE_FACTOR = 40; // 1 foot = 40 pixels
  const canvasWidth = washroom.length * SCALE_FACTOR;
  const canvasHeight = washroom.width * SCALE_FACTOR;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Washroom Layout Designer</CardTitle>
        <CardDescription>
          Design the layout for {washroom.name} ({washroom.length}' × {washroom.width}')
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="design">
          <TabsList className="mb-4">
            <TabsTrigger value="design">Design Layout</TabsTrigger>
            <TabsTrigger value="add">Add Fixtures</TabsTrigger>
          </TabsList>
          
          <TabsContent value="design">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={zoomIn}>
                    <ZoomIn className="h-4 w-4 mr-1" />
                    Zoom In
                  </Button>
                  <Button variant="outline" size="sm" onClick={zoomOut}>
                    <ZoomOut className="h-4 w-4 mr-1" />
                    Zoom Out
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={downloadImage}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="default" size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Save Layout
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md p-2 overflow-auto">
                <div style={{ width: canvasWidth * scale, height: canvasHeight * scale, maxWidth: '100%' }}>
                  <Stage 
                    width={canvasWidth * scale} 
                    height={canvasHeight * scale} 
                    ref={stageRef}
                    scaleX={scale}
                    scaleY={scale}
                  >
                    <Layer>
                      {/* Washroom outline */}
                      <Rect
                        x={0}
                        y={0}
                        width={canvasWidth}
                        height={canvasHeight}
                        fill="#F5F5F5"
                        stroke="#000000"
                        strokeWidth={2}
                      />
                      
                      {/* Grid lines - horizontal */}
                      {Array.from({ length: Math.floor(washroom.width) + 1 }).map((_, i) => (
                        <Line
                          key={`h-${i}`}
                          points={[0, i * SCALE_FACTOR, canvasWidth, i * SCALE_FACTOR]}
                          stroke="#CCCCCC"
                          strokeWidth={1}
                          dash={[5, 5]}
                        />
                      ))}
                      
                      {/* Grid lines - vertical */}
                      {Array.from({ length: Math.floor(washroom.length) + 1 }).map((_, i) => (
                        <Line
                          key={`v-${i}`}
                          points={[i * SCALE_FACTOR, 0, i * SCALE_FACTOR, canvasHeight]}
                          stroke="#CCCCCC"
                          strokeWidth={1}
                          dash={[5, 5]}
                        />
                      ))}
                      
                      {/* Fixtures */}
                      {layoutItems.map((item) => (
                        <React.Fragment key={item.id}>
                          <Rect
                            x={item.x * SCALE_FACTOR}
                            y={item.y * SCALE_FACTOR}
                            width={item.width * SCALE_FACTOR}
                            height={item.height * SCALE_FACTOR}
                            fill={item.color}
                            stroke="#333333"
                            strokeWidth={1}
                            rotation={item.rotation}
                            cornerRadius={item.type === 'sink' ? 5 : 0}
                          />
                          <Text
                            x={item.x * SCALE_FACTOR}
                            y={item.y * SCALE_FACTOR}
                            text={item.name}
                            fontSize={12}
                            padding={5}
                            fill="#333333"
                          />
                        </React.Fragment>
                      ))}
                    </Layer>
                  </Stage>
                </div>
              </div>
              
              {layoutItems.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Fixtures List</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {layoutItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">X: {item.x}', Y: {item.y}'</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.width}' × {item.height}'</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeFixture(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="add">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fixture Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a fixture type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fixtureTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rotation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rotation (degrees)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="positionX"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>X Position (feet from left)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={washroom.length}
                            step={0.5}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Range: 0 to {washroom.length} feet
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="positionY"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Y Position (feet from top)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={washroom.width}
                            step={0.5}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Range: 0 to {washroom.width} feet
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full">Add Fixture to Layout</Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WashroomLayoutDesigner;
