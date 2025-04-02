
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RealProject } from '@/services/RealProjectService';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { PaginationComponent } from '@/components/admin/shared/PaginationComponent';

interface RealProjectsTableProps {
  projects: RealProject[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onSortChange: (field: string) => void;
  onRefresh: () => void;
}

const RealProjectsTable: React.FC<RealProjectsTableProps> = ({
  projects,
  totalCount,
  currentPage,
  pageSize,
  sortBy,
  sortDirection,
  onPageChange,
  onSortChange,
  onRefresh
}) => {
  const navigate = useNavigate();
  
  const navigateToProject = (id: string) => {
    navigate(`/admin/real-projects/${id}`);
  };
  
  const renderSortIcon = (field: string) => {
    if (sortBy === field) {
      return sortDirection === 'asc' 
        ? <ChevronUp className="h-4 w-4" /> 
        : <ChevronDown className="h-4 w-4" />;
    }
    return null;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'Quoted':
        return <Badge className="bg-amber-500">Quoted</Badge>;
      case 'Finalized':
        return <Badge className="bg-emerald-500">Finalized</Badge>;
      case 'Completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'Cancelled':
        return <Badge className="bg-destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '—';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSortChange('project_id')}
              >
                <div className="flex items-center gap-1">
                  Project ID
                  {renderSortIcon('project_id')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSortChange('client_name')}
              >
                <div className="flex items-center gap-1">
                  Client Name
                  {renderSortIcon('client_name')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onSortChange('created_at')}
              >
                <div className="flex items-center gap-1">
                  Created Date
                  {renderSortIcon('created_at')}
                </div>
              </TableHead>
              <TableHead>
                Status
              </TableHead>
              <TableHead 
                className="cursor-pointer text-right"
                onClick={() => onSortChange('final_quotation_amount')}
              >
                <div className="flex items-center justify-end gap-1">
                  Quotation Amount
                  {renderSortIcon('final_quotation_amount')}
                </div>
              </TableHead>
              <TableHead className="text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow 
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigateToProject(project.id)}
                >
                  <TableCell className="font-medium">
                    {project.project_id}
                  </TableCell>
                  <TableCell>{project.client_name}</TableCell>
                  <TableCell>
                    {format(new Date(project.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(project.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(project.final_quotation_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToProject(project.id);
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <PaginationComponent
        currentPage={currentPage}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default RealProjectsTable;
