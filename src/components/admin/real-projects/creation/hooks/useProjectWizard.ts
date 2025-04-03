
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { WashroomWithAreas } from '../types';
import { RealProjectService } from '@/services/RealProjectService';
import { RealProject } from '@/services/real-projects/types';

// Define the steps in the wizard
const STEPS = ['project-info', 'washrooms', 'scope-of-work', 'summary'];

export const useProjectWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [projectInfo, setProjectInfo] = useState<Record<string, any>>({});
  const [washrooms, setWashrooms] = useState<WashroomWithAreas[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Determine if we can navigate to the next step
  const canNavigateNext = () => {
    if (currentStep === 0) {
      // Project info validation
      const requiredFields = ['client_name', 'client_mobile', 'project_type'];
      return requiredFields.every(field => projectInfo[field]?.trim());
    }
    
    if (currentStep === 1) {
      // Washrooms validation
      return washrooms.length > 0;
    }
    
    return true;
  };
  
  // Navigate to the next step
  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && canNavigateNext()) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Navigate to the previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Handle project creation submission
  const createProject = async (): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      // Prepare project data
      const projectData = {
        ...projectInfo,
        height: projectInfo.height || 8, // Default height if not provided
        width: projectInfo.width || undefined, 
        length: projectInfo.length || undefined,
        status: 'In Progress',
        project_details: {
          address: projectInfo.address || '',
          floor_number: projectInfo.floor_number || '',
          service_lift_available: projectInfo.service_lift_available || false,
        },
      };
      
      // Create the project
      const result = await RealProjectService.createRealProject(projectData);
      
      if (!result.success || !result.project) {
        throw new Error("Failed to create project");
      }
      
      const project: RealProject = result.project;
      
      // Add washrooms to the project
      for (const washroom of washrooms) {
        await RealProjectService.addWashroomToProject(project.id, {
          name: washroom.name,
          length: washroom.length,
          width: washroom.width, 
          height: washroom.height || 8, // Default height if not provided
          area: washroom.floorArea,  // Use floorArea instead of area
          services: washroom.services || {},
          wall_area: washroom.wallArea,
          ceiling_area: washroom.ceilingArea,
        });
      }
      
      toast({
        title: "Project created",
        description: "Real project has been created successfully!"
      });
      
      // Redirect to the project detail page
      navigate(`/admin/real-projects/${project.id}`);
      return true;
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    currentStep,
    projectInfo,
    washrooms,
    isSubmitting,
    setProjectInfo,
    setWashrooms,
    nextStep,
    prevStep,
    createProject,
    canNavigateNext,
  };
};
