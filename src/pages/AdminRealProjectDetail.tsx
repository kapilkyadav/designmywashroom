
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RealProjectService } from '@/services/RealProjectService';
import ProjectDetailHeader from '@/components/admin/real-projects/ProjectDetailHeader';
import ProjectDetailTabs from '@/components/admin/real-projects/ProjectDetailTabs';
import DeleteProjectDialog from '@/components/admin/real-projects/DeleteProjectDialog';
import { LoadingState, ErrorState } from '@/components/admin/real-projects/ProjectDetailStates';

const AdminRealProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: project, isLoading, isError, refetch } = useQuery({
    queryKey: ['real-project', id],
    queryFn: () => RealProjectService.getRealProject(id!),
    enabled: !!id
  });
  
  const handleDelete = async () => {
    if (!id) return;
    
    const success = await RealProjectService.deleteRealProject(id);
    if (success) {
      navigate('/admin/real-projects');
    }
    setIsDeleteDialogOpen(false);
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (isError || !project) {
    return <ErrorState />;
  }
  
  return (
    <div className="space-y-6">
      <ProjectDetailHeader 
        project={project} 
        onDeleteClick={() => setIsDeleteDialogOpen(true)} 
      />
      
      <ProjectDetailTabs 
        project={project} 
        onUpdate={refetch} 
      />
      
      <DeleteProjectDialog 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirm={handleDelete} 
      />
    </div>
  );
};

export default AdminRealProjectDetail;
