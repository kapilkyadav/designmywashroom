
import { useState } from 'react';
import { RealProjectService, ConvertibleRecord } from '@/services/RealProjectService';
import { ProjectInfoValues, WashroomWithAreas } from '../types';
import { toast } from '@/hooks/use-toast';

export function useProjectWizard(
  recordToConvert: ConvertibleRecord | undefined,
  onComplete: (project: any | null) => void,
  onCancel: () => void
) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfoValues | null>(null);
  const [washrooms, setWashrooms] = useState<WashroomWithAreas[]>([]);

  // Handle project info submission
  const handleProjectInfoSubmit = (data: ProjectInfoValues) => {
    setProjectInfo(data);
    setStep(2);
  };
  
  // Handle washrooms step submission
  const handleWashroomsSubmit = (washroomData: WashroomWithAreas[]) => {
    setWashrooms(washroomData);
    setStep(3);
  };
  
  // Handle washroom scope selection
  const handleScopeSubmit = (updatedWashrooms: WashroomWithAreas[]) => {
    setWashrooms(updatedWashrooms);
    setStep(4);
  };
  
  // Navigate back to previous step
  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };
  
  // Cancel the wizard
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All entered data will be lost.")) {
      onCancel();
    }
  };
  
  // Handle final submission of the entire project
  const handleSubmitProject = async () => {
    if (!projectInfo) return;
    
    try {
      setIsSubmitting(true);
      
      let result;
      
      // Create project with new fields
      const projectData = {
        ...projectInfo,
        // Store additional fields in project_details
        project_details: {
          address: projectInfo.address,
          floor_number: projectInfo.floor_number || null,
          service_lift_available: projectInfo.service_lift_available || false,
        },
      };
      
      // Convert from lead or estimate if needed
      if (recordToConvert) {
        if (recordToConvert.record_type === 'lead') {
          result = await RealProjectService.convertLeadToRealProject(
            recordToConvert.record_id,
            projectData
          );
        } else if (recordToConvert.record_type === 'project_estimate') {
          result = await RealProjectService.convertEstimateToRealProject(
            recordToConvert.record_id,
            projectData
          );
        } else {
          // Direct creation without conversion
          result = await RealProjectService.createRealProject(projectData);
        }
      } else {
        // Direct creation without conversion
        result = await RealProjectService.createRealProject(projectData);
      }
      
      if (result.success && result.project) {
        // Create all washrooms with their scope of work
        const washroomPromises = washrooms.map(washroom => {
          const washroomData = {
            project_id: result.project!.id,
            name: washroom.name,
            length: washroom.length,
            width: washroom.width,
            height: washroom.height,
            area: washroom.floorArea,
            wall_area: washroom.wallArea,
            ceiling_area: washroom.ceilingArea,
            services: washroom.services || {}
          };
          
          return RealProjectService.addWashroomToProject(result.project!.id, washroomData);
        });
        
        await Promise.all(washroomPromises);
        
        toast({
          title: "Project created successfully",
          description: `Project ${result.project.project_id} has been created with ${washrooms.length} washroom(s)`,
        });
        
        onComplete(result.project);
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Error creating project",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    isSubmitting,
    projectInfo,
    washrooms,
    handleProjectInfoSubmit,
    handleWashroomsSubmit,
    handleScopeSubmit,
    handleSubmitProject,
    goToPreviousStep,
    handleCancel
  };
}
