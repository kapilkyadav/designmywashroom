
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSyncConfig } from './hooks/useSyncConfig';
import GeneralTab from './tabs/GeneralTab';
import SheetSettingsTab from './tabs/SheetSettingsTab';
import ColumnMappingTab from './tabs/ColumnMappingTab';

const LeadsSyncConfig: React.FC = () => {
  const {
    isLoading,
    isSaving,
    currentTab,
    setCurrentTab,
    config,
    setConfig,
    handleSyncIntervalChange,
    handleIntervalUnitChange,
    handleAutoSyncChange,
    handleColumnMappingChange,
    handleSave,
    handleSheetNameChange,
    handleHeaderRowChange
  } = useSyncConfig();
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Synchronization Settings</CardTitle>
        <CardDescription>
          Configure how leads are synchronized from your Google Sheet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sheet">Sheet Settings</TabsTrigger>
            <TabsTrigger value="mapping">Column Mapping</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <GeneralTab
              config={config}
              setConfig={setConfig}
              handleAutoSyncChange={handleAutoSyncChange}
              handleIntervalUnitChange={handleIntervalUnitChange}
              handleSyncIntervalChange={handleSyncIntervalChange}
              handleSave={handleSave}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="sheet">
            <SheetSettingsTab
              config={config}
              handleSheetNameChange={handleSheetNameChange}
              handleHeaderRowChange={handleHeaderRowChange}
              handleSave={handleSave}
              isSaving={isSaving}
            />
          </TabsContent>
          
          <TabsContent value="mapping">
            <ColumnMappingTab
              config={config}
              handleColumnMappingChange={handleColumnMappingChange}
              handleSave={handleSave}
              isSaving={isSaving}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LeadsSyncConfig;
