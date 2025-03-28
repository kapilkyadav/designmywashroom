
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LeadService, Lead, LeadFilter } from '@/services/LeadService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Loader2, Filter, Search, RefreshCcw, Plus } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import LeadsTable from '@/components/admin/leads/LeadsTable';
import LeadsSyncConfig from '@/components/admin/leads/LeadsSyncConfig';

const AdminLeads = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [filters, setFilters] = useState<LeadFilter>({
    status: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    search: "",
    page: 1,
    pageSize: 10,
    sortBy: "created_at",
    sortDirection: "desc"
  });
  
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { 
    data, 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => LeadService.getLeads(filters),
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
  
  const handleSyncNow = async () => {
    try {
      setIsSyncing(true);
      console.log('Triggering manual sync...');
      const result = await LeadService.syncLeads();
      if (result) {
        refetch();
        toast({
          title: "Sync completed",
          description: "Leads have been synchronized from Google Sheet",
        });
      }
    } catch (error) {
      console.error("Error syncing leads:", error);
      toast({
        title: "Sync failed",
        description: "There was an error synchronizing leads",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
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
  
  // Calculate active filters count
  const activeFiltersCount = [
    filters.status,
    filters.dateFrom,
    filters.dateTo,
    filters.search
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Leads Management</h1>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncNow}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setActiveTab("settings")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Configure Sync
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Leads</TabsTrigger>
          <TabsTrigger value="New">New</TabsTrigger>
          <TabsTrigger value="Contacted">Contacted</TabsTrigger>
          <TabsTrigger value="Qualified">Qualified</TabsTrigger>
          <TabsTrigger value="Lost">Lost</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <LeadsSyncConfig />
        </TabsContent>
        
        {activeTab !== "settings" && (
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>
                  View and manage your leads data
                </CardDescription>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leads by name, phone, location..."
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
                      
                      <div>
                        <p className="mb-2 text-sm font-medium">Budget Preference:</p>
                        <Select 
                          onValueChange={(value) => setFilters({ ...filters, budget: value !== "all" ? value : undefined, page: 1 })}
                          value={filters.budget || "all"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Budgets" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Budgets</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
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
                    Error loading leads data. Please try again.
                  </div>
                ) : (
                  <LeadsTable 
                    leads={data?.data || []}
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
        )}
      </Tabs>
    </div>
  );
};

export default AdminLeads;
