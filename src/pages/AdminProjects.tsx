
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProjectService } from '@/services/ProjectService';
import { Project } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search, FileText, Loader2, Calendar, Download, Trash2, 
  MoreHorizontal, Eye, Edit, CheckSquare, ChevronUp, ChevronDown,
  AlertCircle
} from 'lucide-react';

const AdminProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [allSelected, setAllSelected] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

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
      
      // Check for data issues
      let hasDataIssues = false;
      data.forEach(project => {
        if (!project.client_name && !project.client_email && !project.client_mobile) {
          console.warn('Project with missing client data:', project.id);
          hasDataIssues = true;
        }
      });
      
      if (hasDataIssues) {
        setDataError("Some projects have incomplete customer information. This might indicate an issue with data capture.");
      } else {
        setDataError(null);
      }
      
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
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        project => 
          (project.client_name && project.client_name.toLowerCase().includes(query)) || 
          (project.client_email && project.client_email.toLowerCase().includes(query)) ||
          (project.client_location && project.client_location.toLowerCase().includes(query)) ||
          (project.client_mobile && project.client_mobile.toLowerCase().includes(query))
      );
    }
    
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(project => project.project_type === typeFilter);
    }
    
    switch(sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.final_estimate - a.final_estimate);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.final_estimate - b.final_estimate);
        break;
      case 'name-asc':
        filtered.sort((a, b) => (a.client_name || '').localeCompare(b.client_name || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b.client_name || '').localeCompare(a.client_name || ''));
        break;
    }
    
    setFilteredProjects(filtered);
    
    setSelectedProjects(new Set());
    setAllSelected(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewProject = (id: string) => {
    navigate(`/admin/projects/detail/${id}`);
  };

  const handleEditProject = (id: string) => {
    navigate(`/admin/projects/edit/${id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    
    try {
      await ProjectService.deleteProject(projectToDelete);
      setProjects(projects.filter(p => p.id !== projectToDelete));
      
      toast({
        title: "Success",
        description: "Project has been deleted",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setProjectToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      setLoading(true);
      
      for (const id of selectedProjects) {
        await ProjectService.deleteProject(id);
      }
      
      const updatedProjects = projects.filter(p => !selectedProjects.has(p.id));
      setProjects(updatedProjects);
      
      setSelectedProjects(new Set());
      setAllSelected(false);
      
      toast({
        title: "Success",
        description: `${selectedProjects.size} projects have been deleted`,
      });
    } catch (error) {
      console.error('Error deleting projects:', error);
      toast({
        title: "Error",
        description: "Failed to delete some projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedProjects(new Set());
    } else {
      const newSelection = new Set<string>();
      filteredProjects.forEach(project => newSelection.add(project.id));
      setSelectedProjects(newSelection);
    }
    
    setAllSelected(!allSelected);
  };

  const handleSelectProject = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedProjects);
    
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    
    setSelectedProjects(newSelection);
    
    setAllSelected(newSelection.size === filteredProjects.length && newSelection.size > 0);
  };

  const exportSelectedProjects = () => {
    const selectedData = projects.filter(p => selectedProjects.has(p.id));
    
    const exportData = selectedData.map(p => ({
      client_name: p.client_name || 'Unknown',
      client_email: p.client_email || 'No email',
      client_mobile: p.client_mobile || 'No mobile',
      client_location: p.client_location || 'No location',
      project_type: p.project_type,
      dimensions: `${p.length} × ${p.width} ft`,
      final_estimate: p.final_estimate,
      created_at: new Date(p.created_at).toLocaleDateString()
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'projects-export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setSortOption('newest');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Project Estimates</h1>
        <div className="flex gap-2">
          {selectedProjects.size > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportSelectedProjects}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Selected
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </>
          )}
        </div>
      </div>

      {dataError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 flex items-start space-x-3 mb-4">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p className="font-medium">{dataError}</p>
            <p className="text-sm mt-1">Some contact data may be missing or not displaying correctly for projects.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name, email, mobile or location..."
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
              <SelectItem value="all">All Types</SelectItem>
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
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(searchQuery || typeFilter !== '' || sortOption !== 'newest') && (
        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-muted/40">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Active filters:</span>
            {searchQuery && <span className="ml-2">Search: "{searchQuery}"</span>}
            {typeFilter && <span className="ml-2">Type: {typeFilter.replace('-', ' ')}</span>}
            {sortOption !== 'newest' && <span className="ml-2">Sort: {sortOption}</span>}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters} 
            className="h-7 text-xs"
          >
            Reset
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={allSelected && filteredProjects.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="min-w-[180px]">Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead className="text-right">Estimate</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <TableRow 
                      key={project.id} 
                      className={selectedProjects.has(project.id) ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedProjects.has(project.id)}
                          onCheckedChange={(checked) => 
                            handleSelectProject(project.id, checked as boolean)
                          }
                          aria-label={`Select project ${project.client_name || ''}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>{project.client_name || 'Unknown Client'}</div>
                        <div className="text-xs text-muted-foreground">
                          {project.client_email || 'No email provided'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {project.client_mobile || 'No mobile provided'}
                        </div>
                      </TableCell>
                      <TableCell>{project.client_location || 'Unknown Location'}</TableCell>
                      <TableCell className="capitalize">
                        {project.project_type.replace('-', ' ')}
                      </TableCell>
                      <TableCell>
                        {project.length} × {project.width} ft
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(project.final_estimate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProject(project.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setProjectToDelete(project.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {searchQuery.trim() !== '' || typeFilter ? (
                        <div className="flex flex-col items-center">
                          <p className="text-muted-foreground mb-2">No projects matching your filters</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={resetFilters}
                          >
                            Reset Filters
                          </Button>
                        </div>
                      ) : (
                        "No projects found."
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {selectedProjects.size > 0 && (
            <div className="flex items-center justify-between py-2 px-4 rounded-md bg-secondary animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''} selected</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedProjects(new Set())}
                className="h-7 text-xs"
              >
                Clear selection
              </Button>
            </div>
          )}
        </>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete multiple projects?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete {selectedProjects.size} project{selectedProjects.size !== 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProjects;
