
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { RealProject } from '@/services/RealProjectService';

interface ProjectDetailHeaderProps {
  project: RealProject;
  onDeleteClick: () => void;
}

const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({ project, onDeleteClick }) => {
  const navigate = useNavigate();

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

  return (
    <>
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost"
          onClick={() => navigate('/admin/real-projects')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onDeleteClick}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Project
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between bg-card p-6 rounded-lg shadow-md gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.project_id}</h1>
          <p className="text-muted-foreground">{project.client_name}</p>
          <div className="mt-2">
            {getStatusBadge(project.status)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Created On:</span> 
            <span className="ml-2 font-medium">{format(new Date(project.created_at), 'dd MMM yyyy')}</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">Last Updated:</span> 
            <span className="ml-2 font-medium">{format(new Date(project.last_updated_at), 'dd MMM yyyy')}</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">Client Phone:</span> 
            <span className="ml-2 font-medium">{project.client_mobile}</span>
          </div>
          
          <div>
            <span className="text-muted-foreground">Location:</span> 
            <span className="ml-2 font-medium">{project.client_location || 'Not specified'}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetailHeader;
