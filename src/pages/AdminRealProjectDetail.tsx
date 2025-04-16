
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { RealProjectService } from '@/services/RealProjectService';
import { BrandService } from '@/services/BrandService';
import ProjectDetailHeader from '@/components/admin/real-projects/ProjectDetailHeader';
import ProjectDetailTabs from '@/components/admin/real-projects/ProjectDetailTabs';
import DeleteProjectDialog from '@/components/admin/real-projects/DeleteProjectDialog';
import { LoadingState, ErrorState } from '@/components/admin/real-projects/ProjectDetailStates';

const AdminRealProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandName, setBrandName] = useState<string>("");
  
  const { data: project, isLoading, isError, refetch } = useQuery({
    queryKey: ['real-project', id],
    queryFn: () => RealProjectService.getRealProject(id!),
    enabled: !!id
  });
  
  // Fetch brand name when project loads
  useEffect(() => {
    const fetchBrandName = async () => {
      if (project?.selected_brand) {
        try {
          const brand = await BrandService.getBrandById(project.selected_brand);
          setBrandName(brand.name);
        } catch (error) {
          console.error('Error fetching brand name:', error);
          setBrandName("Unknown Brand");
        }
      }
    };
    
    if (project) {
      fetchBrandName();
    }
  }, [project]);
  
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
  
  // Add brandName to the project object for components that need it
  const projectWithBrandName = {
    ...project,
    brandName
  };
  
  return (
    <div className="space-y-6">
      <ProjectDetailHeader 
        project={projectWithBrandName}
        onDeleteClick={() => setIsDeleteDialogOpen(true)} 
      />
      
      <ProjectDetailTabs 
        project={projectWithBrandName}
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
