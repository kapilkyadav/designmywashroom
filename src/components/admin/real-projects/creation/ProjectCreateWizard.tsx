
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ConvertibleRecord } from '@/services/real-projects/types';

import ProjectInfoStep from './steps/ProjectInfoStep';
import WashroomsStep from './steps/WashroomsStep';
import WashroomScopeStep from './steps/WashroomScopeStep';
import SummaryStep from './steps/SummaryStep';
import WizardHeader from './components/WizardHeader';
import WizardFooter from './components/WizardFooter';
import { useProjectWizard } from './hooks/useProjectWizard';
import { useProjectInfoForm } from './hooks/useProjectInfoForm';

interface ProjectCreateWizardProps {
  recordToConvert?: ConvertibleRecord;
  onComplete: () => void;
  onCancel: () => void;
}

const ProjectCreateWizard: React.FC<ProjectCreateWizardProps> = ({ 
  recordToConvert, 
  onComplete, 
  onCancel 
}) => {
  const {
    currentStep,
    isSubmitting,
    projectInfo,
    washrooms,
    setProjectInfo,
    setWashrooms,
    nextStep,
    prevStep,
    createProject,
    canNavigateNext
  } = useProjectWizard();
  
  const projectInfoForm = useProjectInfoForm(recordToConvert);
  
  const handleProjectInfoSubmit = (values: any) => {
    setProjectInfo(values);
    nextStep();
  };

  const handleWashroomsSubmit = (washroomData: any) => {
    setWashrooms(washroomData);
    nextStep();
  };

  const handleScopeSubmit = () => {
    nextStep();
  };

  const handleSubmitProject = async () => {
    const success = await createProject();
    if (success) {
      onComplete();
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <WizardHeader step={currentStep} recordToConvert={recordToConvert} />
        
        <CardContent>
          {currentStep === 0 && (
            <ProjectInfoStep 
              form={projectInfoForm} 
              onSubmit={handleProjectInfoSubmit} 
            />
          )}
          
          {currentStep === 1 && projectInfo && (
            <WashroomsStep 
              initialWashrooms={washrooms}
              onSubmit={handleWashroomsSubmit} 
            />
          )}
          
          {currentStep === 2 && (
            <WashroomScopeStep 
              washrooms={washrooms}
              onSubmit={handleScopeSubmit} 
            />
          )}
          
          {currentStep === 3 && projectInfo && (
            <SummaryStep 
              projectInfo={projectInfo}
              washrooms={washrooms}
            />
          )}
        </CardContent>
        
        <WizardFooter
          step={currentStep}
          isSubmitting={isSubmitting}
          onBack={prevStep}
          onCancel={onCancel}
          onSubmit={handleSubmitProject}
        />
      </Card>
    </div>
  );
};

export default ProjectCreateWizard;
