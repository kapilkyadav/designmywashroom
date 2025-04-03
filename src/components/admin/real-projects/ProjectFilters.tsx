
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface ProjectFiltersProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filtersPanelOpen: boolean;
  toggleFiltersPanel: () => void;
  activeFiltersCount: number;
  onDateRangeChange: (range: { from: Date; to: Date } | undefined) => void;
  clearFilters: () => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  search,
  onSearchChange,
  filtersPanelOpen,
  toggleFiltersPanel,
  activeFiltersCount,
  onDateRangeChange,
  clearFilters
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by ID, client name, phone..."
            className="pl-8"
            value={search}
            onChange={onSearchChange}
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
                onChange={onDateRangeChange}
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
    </div>
  );
};

export default ProjectFilters;
