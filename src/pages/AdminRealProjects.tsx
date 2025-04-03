
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RealProjectService, RealProjectFilter } from '@/services/RealProjectService';
import { format } from 'date-fns';
import ConvertRecordDialog from '@/components/admin/real-projects/ConvertRecordDialog';
import PageHeader from '@/components/admin/real-projects/PageHeader';
import ProjectsTabs from '@/components/admin/real-projects/ProjectsTabs';
import ProjectsContent from '@/components/admin/real-projects/ProjectsContent';

const AdminRealProjects = () => {
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
      <PageHeader onCreateProject={handleCreateProject} />
      
      <ProjectsTabs activeTab={activeTab} onTabChange={handleTabChange}>
        <ProjectsContent 
          isLoading={isLoading}
          isError={isError}
          data={data}
          filters={filters}
          filtersPanelOpen={filtersPanelOpen}
          toggleFiltersPanel={toggleFiltersPanel}
          activeFiltersCount={activeFiltersCount}
          handleSearch={handleSearch}
          handleDateRangeChange={handleDateRangeChange}
          clearFilters={clearFilters}
          handlePageChange={handlePageChange}
          handleSortChange={handleSortChange}
          refetch={refetch}
        />
      </ProjectsTabs>
      
      <ConvertRecordDialog 
        open={isConvertDialogOpen} 
        onOpenChange={setIsConvertDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default AdminRealProjects;
