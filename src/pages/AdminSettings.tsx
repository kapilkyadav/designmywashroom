
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsService } from '@/services/SettingsService';
import { Settings } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Save, Loader2, IndianRupee } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await SettingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (settings) {
      setSettings({ ...settings, [name]: parseFloat(value) || 0 });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings) return;
    
    try {
      setSaving(true);
      await SettingsService.updateSettings({
        plumbing_rate_per_sqft: settings.plumbing_rate_per_sqft,
        tile_cost_per_unit: settings.tile_cost_per_unit,
        tiling_labor_per_sqft: settings.tiling_labor_per_sqft,
        breakage_percentage: settings.breakage_percentage
      });
      
      toast({
        title: "Settings saved",
        description: "Your pricing settings have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pricing Settings</h1>
      
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Calculation Parameters</CardTitle>
          <CardDescription>
            Set the pricing parameters used for calculating cost estimates
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="plumbing_rate_per_sqft" className="flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  Plumbing Rate (per sq. ft.)
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="plumbing_rate_per_sqft"
                    name="plumbing_rate_per_sqft"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings?.plumbing_rate_per_sqft || 0}
                    onChange={handleChange}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  The rate charged per square foot for plumbing work
                </p>
              </div>
              
              <div>
                <Label htmlFor="tile_cost_per_unit" className="flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  Tile Cost (per unit)
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="tile_cost_per_unit"
                    name="tile_cost_per_unit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings?.tile_cost_per_unit || 0}
                    onChange={handleChange}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  The cost of each 2x2 tile unit
                </p>
              </div>
              
              <div>
                <Label htmlFor="tiling_labor_per_sqft" className="flex items-center">
                  <IndianRupee className="h-4 w-4 mr-1" />
                  Tiling Labor (per sq. ft.)
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="tiling_labor_per_sqft"
                    name="tiling_labor_per_sqft"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings?.tiling_labor_per_sqft || 0}
                    onChange={handleChange}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  The labor cost per square foot for tiling work
                </p>
              </div>
              
              <div>
                <Label htmlFor="breakage_percentage">
                  Breakage Percentage
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="breakage_percentage"
                    name="breakage_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={settings?.breakage_percentage || 0}
                    onChange={handleChange}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Extra percentage of tiles to account for breakage
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              type="submit" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminSettings;
