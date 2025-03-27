
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
import { ProjectService } from '@/services/ProjectService';
import { Project } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search, FileText, Loader2, Calendar, Download
} from 'lucide-react';

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [searchQuery, typeFilter, sortOption, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await ProjectService.getAllProjects();
      setProjects(data);
      setFilteredProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];
    
    // Apply search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        project => 
          project.client_name.toLowerCase().includes(query) || 
          project.client_email.toLowerCase().includes(query) ||
          project.client_location.toLowerCase().includes(query)
      );
    }
    
    // Apply project type filter
    if (typeFilter) {
      filtered = filtered.filter(project => project.project_type === typeFilter);
    }
    
    // Apply sorting
    if (sortOption === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortOption === 'highest') {
      filtered.sort((a, b) => b.final_estimate - a.final_estimate);
    } else if (sortOption === 'lowest') {
      filtered.sort((a, b) => a.final_estimate - b.final_estimate);
    }
    
    setFilteredProjects(filtered);
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
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name, email, or location..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="new-construction">New Construction</SelectItem>
              <SelectItem value="renovation">Renovation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Value</SelectItem>
              <SelectItem value="lowest">Lowest Value</SelectItem>
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Dimensions</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Estimate</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                  <th className="w-[100px] px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="border-t hover:bg-secondary/50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{project.client_name}</div>
                        <div className="text-xs text-muted-foreground">{project.client_email}</div>
                        <div className="text-xs text-muted-foreground">{project.client_mobile}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{project.client_location}</td>
                      <td className="px-4 py-3 text-sm capitalize">
                        {project.project_type.replace('-', ' ')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {project.length} × {project.width} ft
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatCurrency(project.final_estimate)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      {searchQuery.trim() !== '' || typeFilter
                        ? "No projects matching your filters" 
                        : "No projects found."}
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

export default AdminProjects;
