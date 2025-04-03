
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  onCreateProject: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onCreateProject }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-3xl font-bold">Real Projects</h1>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="default"
          size="sm"
          onClick={onCreateProject}
        >
          <Plus className="mr-2 h-4 w-4" />
          Convert to Project
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
