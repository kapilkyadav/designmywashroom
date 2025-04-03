
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import RealProjectsTable from '@/components/admin/real-projects/RealProjectsTable';
import ProjectFilters from '@/components/admin/real-projects/ProjectFilters';

interface ProjectsContentProps {
  isLoading: boolean;
  isError: boolean;
  data: any;
  filters: any;
  filtersPanelOpen: boolean;
  toggleFiltersPanel: () => void;
  activeFiltersCount: number;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateRangeChange: (range: { from: Date; to: Date } | undefined) => void;
  clearFilters: () => void;
  handlePageChange: (page: number) => void;
  handleSortChange: (field: string) => void;
  refetch: () => void;
}

const ProjectsContent: React.FC<ProjectsContentProps> = ({
  isLoading,
  isError,
  data,
  filters,
  filtersPanelOpen,
  toggleFiltersPanel,
  activeFiltersCount,
  handleSearch,
  handleDateRangeChange,
  clearFilters,
  handlePageChange,
  handleSortChange,
  refetch
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Real Projects</CardTitle>
        <CardDescription>
          View and manage real projects
        </CardDescription>
        
        <ProjectFilters 
          search={filters.search}
          onSearchChange={handleSearch}
          filtersPanelOpen={filtersPanelOpen}
          toggleFiltersPanel={toggleFiltersPanel}
          activeFiltersCount={activeFiltersCount}
          onDateRangeChange={handleDateRangeChange}
          clearFilters={clearFilters}
        />
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
  );
};

export default ProjectsContent;
