
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RealProject, ConvertibleRecord } from '@/services/RealProjectService';

import ProjectInfoStep from './steps/ProjectInfoStep';
import WashroomsStep from './steps/WashroomsStep';
import WashroomScopeStep from './steps/WashroomScopeStep';
import SummaryStep from './steps/SummaryStep';
import WizardHeader from './components/WizardHeader';
import WizardFooter from './components/WizardFooter';
import { useProjectWizard } from './hooks/useProjectWizard';
import { useProjectInfoForm } from './hooks/useProjectInfoForm';
import { WashroomWithAreas, ProjectInfoValues } from './types';

interface ProjectCreateWizardProps {
  recordToConvert?: ConvertibleRecord;
  onComplete: (project: RealProject | null) => void;
  onCancel: () => void;
}

const ProjectCreateWizard: React.FC<ProjectCreateWizardProps> = ({ 
  recordToConvert, 
  onComplete, 
  onCancel 
}) => {
  const {
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
  } = useProjectWizard(recordToConvert, onComplete, onCancel);
  
  const projectInfoForm = useProjectInfoForm(recordToConvert);
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <WizardHeader step={step} recordToConvert={recordToConvert} />
        
        <CardContent>
          {step === 1 && (
            <ProjectInfoStep 
              form={projectInfoForm} 
              onSubmit={handleProjectInfoSubmit} 
            />
          )}
          
          {step === 2 && projectInfo && (
            <WashroomsStep 
              initialWashrooms={washrooms}
              onSubmit={handleWashroomsSubmit} 
            />
          )}
          
          {step === 3 && (
            <WashroomScopeStep 
              washrooms={washrooms}
              onSubmit={handleScopeSubmit} 
            />
          )}
          
          {step === 4 && projectInfo && (
            <SummaryStep 
              projectInfo={projectInfo}
              washrooms={washrooms}
            />
          )}
        </CardContent>
        
        <WizardFooter
          step={step}
          isSubmitting={isSubmitting}
          onBack={goToPreviousStep}
          onCancel={handleCancel}
          onSubmit={handleSubmitProject}
        />
      </Card>
    </div>
  );
};

export default ProjectCreateWizard;
