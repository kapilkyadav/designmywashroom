
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FixtureService } from '@/services/FixtureService';
import { Fixture } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  Search, Plus, FilePenLine, Trash2, Loader2
} from 'lucide-react';

const AdminFixtures = () => {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [filteredFixtures, setFilteredFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    fetchFixtures();
  }, []);

  useEffect(() => {
    filterFixtures();
  }, [searchQuery, categoryFilter, fixtures]);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      const data = await FixtureService.getAllFixtures();
      setFixtures(data);
      setFilteredFixtures(data);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      toast({
        title: "Error",
        description: "Failed to load fixtures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFixtures = () => {
    let filtered = [...fixtures];
    
    // Apply search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        fixture => fixture.name.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(fixture => fixture.category === categoryFilter);
    }
    
    setFilteredFixtures(filtered);
  };

  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Fixtures</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Fixture
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fixtures..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="additional">Additional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Fixture Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">MRP</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Landing Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Client Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Margin</th>
                  <th className="w-[100px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFixtures.length > 0 ? (
                  filteredFixtures.map((fixture) => (
                    <tr key={fixture.id} className="border-t hover:bg-secondary/50">
                      <td className="px-4 py-3 font-medium">{fixture.name}</td>
                      <td className="px-4 py-3 text-sm capitalize">{fixture.category}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(fixture.mrp)}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(fixture.landing_price)}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(fixture.client_price)}</td>
                      <td className="px-4 py-3 text-sm">{fixture.margin.toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <FilePenLine className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      {searchQuery.trim() !== '' || categoryFilter
                        ? "No fixtures matching your filters" 
                        : "No fixtures found. Add your first fixture to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFixtures;
