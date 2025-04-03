
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';
import { RealProject, RealProjectService, ConvertibleRecord } from '@/services/RealProjectService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import ProjectInfoStep from './steps/ProjectInfoStep';
import WashroomsStep from './steps/WashroomsStep';
import WashroomScopeStep from './steps/WashroomScopeStep';
import SummaryStep from './steps/SummaryStep';

interface ProjectCreateWizardProps {
  recordToConvert?: ConvertibleRecord;
  onComplete: (project: RealProject | null) => void;
  onCancel: () => void;
}

// Define all the steps in the wizard
type WizardStep = 'project-info' | 'washrooms' | 'washroom-scope' | 'summary';

// Project info step schema
const projectInfoSchema = z.object({
  client_name: z.string().min(2, "Client name is required"),
  client_email: z.string().email().optional().or(z.literal('')),
  client_mobile: z.string().min(10, "Valid mobile number required"),
  client_location: z.string().min(3, "Location is required"),
  address: z.string().min(5, "Full address is required"),
  floor_number: z.string().optional(),
  service_lift_available: z.boolean().optional(),
  project_type: z.string().min(1, "Project type is required"),
  selected_brand: z.string().optional(),
});

export type ProjectInfoValues = z.infer<typeof projectInfoSchema>;

// Define the type for a washroom with calculated areas
export interface WashroomWithAreas {
  id?: string;
  name: string;
  length: number;
  width: number;
  height: number;
  floorArea: number;
  wallArea: number;
  ceilingArea: number;
  services: Record<string, boolean>;
}

const ProjectCreateWizard: React.FC<ProjectCreateWizardProps> = ({ 
  recordToConvert, 
  onComplete, 
  onCancel 
}) => {
  // Current step in the wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>('project-info');
  
  // Store all project data across steps
  const [projectInfo, setProjectInfo] = useState<ProjectInfoValues | null>(null);
  const [washrooms, setWashrooms] = useState<WashroomWithAreas[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form for the project info step
  const projectInfoForm = useForm<ProjectInfoValues>({
    resolver: zodResolver(projectInfoSchema),
    defaultValues: {
      client_name: recordToConvert?.client_name || '',
      client_email: recordToConvert?.client_email || '',
      client_mobile: recordToConvert?.client_mobile || '',
      client_location: recordToConvert?.client_location || '',
      address: '',
      floor_number: '',
      service_lift_available: false,
      project_type: 'Not Specified',
      selected_brand: '',
    }
  });
  
  // Handle project info submission
  const handleProjectInfoSubmit = (data: ProjectInfoValues) => {
    setProjectInfo(data);
    setCurrentStep('washrooms');
  };
  
  // Handle washrooms step submission
  const handleWashroomsSubmit = (washroomData: WashroomWithAreas[]) => {
    setWashrooms(washroomData);
    setCurrentStep('washroom-scope');
  };
  
  // Handle washroom scope selection
  const handleScopeSubmit = (updatedWashrooms: WashroomWithAreas[]) => {
    setWashrooms(updatedWashrooms);
    setCurrentStep('summary');
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
        } else {
          result = await RealProjectService.convertEstimateToRealProject(
            recordToConvert.record_id,
            projectData
          );
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
  
  // Navigate back to previous step
  const goToPreviousStep = () => {
    if (currentStep === 'washrooms') {
      setCurrentStep('project-info');
    } else if (currentStep === 'washroom-scope') {
      setCurrentStep('washrooms');
    } else if (currentStep === 'summary') {
      setCurrentStep('washroom-scope');
    }
  };
  
  // Cancel the wizard
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? All entered data will be lost.")) {
      onCancel();
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {recordToConvert 
              ? `Convert ${recordToConvert.record_type === 'lead' ? 'Lead' : 'Estimate'} to Project` 
              : "Create New Project"}
          </CardTitle>
          <CardDescription>
            Step {currentStep === 'project-info' ? '1' : 
                 currentStep === 'washrooms' ? '2' : 
                 currentStep === 'washroom-scope' ? '3' : '4'} of 4
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {currentStep === 'project-info' && (
            <ProjectInfoStep 
              form={projectInfoForm} 
              onSubmit={handleProjectInfoSubmit} 
            />
          )}
          
          {currentStep === 'washrooms' && projectInfo && (
            <WashroomsStep 
              initialWashrooms={washrooms}
              onSubmit={handleWashroomsSubmit} 
            />
          )}
          
          {currentStep === 'washroom-scope' && (
            <WashroomScopeStep 
              washrooms={washrooms}
              onSubmit={handleScopeSubmit} 
            />
          )}
          
          {currentStep === 'summary' && projectInfo && (
            <SummaryStep 
              projectInfo={projectInfo}
              washrooms={washrooms}
            />
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {currentStep !== 'project-info' ? (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
          
          {currentStep === 'summary' && (
            <Button
              type="button"
              onClick={handleSubmitProject}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProjectCreateWizard;
