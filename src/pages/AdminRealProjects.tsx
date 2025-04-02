
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RealProjectService, RealProjectFilter } from '@/services/RealProjectService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Loader2, Filter, Search, Plus } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import RealProjectsTable from '@/components/admin/real-projects/RealProjectsTable';
import ConvertRecordDialog from '@/components/admin/real-projects/ConvertRecordDialog';

const AdminRealProjects = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filters, setFilters] = useState<RealProjectFilter>({
    status: undefined,
    search: "",
    page: 1,
    pageSize: 10,
    sortBy: "created_at",
    sortDirection: "desc"
  });
  
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  
  const { 
    data, 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['real-projects', filters],
    queryFn: () => RealProjectService.getRealProjects(filters),
  });
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "all") {
      setFilters({ ...filters, status: undefined });
    } else {
      setFilters({ ...filters, status: value });
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value, page: 1 });
  };
  
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };
  
  const handleSortChange = (field: string) => {
    const direction = filters.sortBy === field && filters.sortDirection === 'asc' ? 'desc' : 'asc';
    setFilters({ ...filters, sortBy: field, sortDirection: direction });
  };
  
  const toggleFiltersPanel = () => {
    setFiltersPanelOpen(!filtersPanelOpen);
  };
  
  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    setFilters({
      ...filters,
      dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
      dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
      page: 1
    });
  };
  
  const clearFilters = () => {
    setFilters({
      status: activeTab !== "all" ? activeTab : undefined,
      dateFrom: undefined,
      dateTo: undefined,
      search: "",
      page: 1,
      pageSize: 10,
      sortBy: "created_at",
      sortDirection: "desc"
    });
  };
  
  const handleCreateProject = () => {
    setIsConvertDialogOpen(true);
  };
  
  const handleProjectCreated = () => {
    setIsConvertDialogOpen(false);
    refetch();
  };
  
  const activeFiltersCount = [
    filters.status,
    filters.dateFrom,
    filters.dateTo,
    filters.search
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Real Projects</h1>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleCreateProject}
          >
            <Plus className="mr-2 h-4 w-4" />
            Convert to Project
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="In Progress">In Progress</TabsTrigger>
          <TabsTrigger value="Quoted">Quoted</TabsTrigger>
          <TabsTrigger value="Finalized">Finalized</TabsTrigger>
          <TabsTrigger value="Completed">Completed</TabsTrigger>
          <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Real Projects</CardTitle>
              <CardDescription>
                View and manage real projects
              </CardDescription>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects by ID, client name, phone..."
                    className="pl-8"
                    value={filters.search}
                    onChange={handleSearch}
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFiltersPanel}
                  className="relative"
                >
                  <Filter className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>
              
              {filtersPanelOpen && (
                <div className="mt-4 p-4 border rounded-md bg-background space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="mb-2 text-sm font-medium">Date Range:</p>
                      <DateRangePicker 
                        onChange={handleDateRangeChange}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center my-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : isError ? (
                <div className="text-center my-8 text-destructive">
                  Error loading projects data. Please try again.
                </div>
              ) : (
                <RealProjectsTable 
                  projects={data?.data || []}
                  totalCount={data?.count || 0}
                  currentPage={filters.page || 1}
                  pageSize={filters.pageSize || 10}
                  sortBy={filters.sortBy}
                  sortDirection={filters.sortDirection}
                  onPageChange={handlePageChange}
                  onSortChange={handleSortChange}
                  onRefresh={refetch}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <ConvertRecordDialog 
        open={isConvertDialogOpen} 
        onOpenChange={setIsConvertDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default AdminRealProjects;
