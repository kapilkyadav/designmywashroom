
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import ProjectCreateWizard from '@/components/admin/real-projects/creation/ProjectCreateWizard';
import { ConvertibleRecord, RealProjectService } from '@/services/RealProjectService';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ConvertRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

const ConvertRecordDialog: React.FC<ConvertRecordDialogProps> = ({ 
  open, 
  onOpenChange,
  onProjectCreated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<ConvertibleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<ConvertibleRecord | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Create an empty convertible record for direct project creation
  const emptyRecord: ConvertibleRecord = {
    record_type: "direct",
    record_id: "",
    client_name: "",
    client_email: "",
    client_mobile: "",
    client_location: "",
    created_date: new Date().toISOString(),
    status: "In Progress",
    real_project_id: null
  };

  // Fetch convertible records when dialog opens
  useEffect(() => {
    if (open) {
      fetchRecords();
    } else {
      // Reset state when dialog closes
      setSelectedRecord(null);
      setShowWizard(false);
    }
  }, [open]);

  // Fetch records from API
  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await RealProjectService.getConvertibleRecords();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching convertible records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records based on search term and active tab
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.client_mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.client_location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'leads' && record.record_type === 'lead') ||
      (activeTab === 'estimates' && record.record_type === 'estimate');
    
    return matchesSearch && matchesTab;
  });

  // Handle record selection
  const handleSelectRecord = (record: ConvertibleRecord) => {
    setSelectedRecord(record);
    setShowWizard(true);
  };

  // Handle create new project directly
  const handleCreateDirect = () => {
    setSelectedRecord(emptyRecord);
    setShowWizard(true);
  };

  // This will be called when the project creation is completed
  const handleProjectCreated = () => {
    setIsLoading(false);
    onProjectCreated();
    onOpenChange(false);
  };

  // If the user cancels the conversion
  const handleCancel = () => {
    if (showWizard) {
      setShowWizard(false);
      setSelectedRecord(null);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showWizard ? 'Create New Project' : 'Select Record to Convert'}
          </DialogTitle>
          <DialogDescription>
            {showWizard 
              ? 'Fill in the details to create a new project' 
              : 'Select a lead or estimate to convert, or create a new project directly'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading records...</span>
          </div>
        ) : showWizard && selectedRecord ? (
          <ProjectCreateWizard 
            recordToConvert={selectedRecord}
            onComplete={handleProjectCreated}
            onCancel={handleCancel}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, location..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateDirect}>
                Create New Project
              </Button>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Records</TabsTrigger>
                <TabsTrigger value="leads">Leads</TabsTrigger>
                <TabsTrigger value="estimates">Project Estimates</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="mt-4">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                          <TableRow key={`${record.record_type}-${record.record_id}`}>
                            <TableCell className="font-medium">{record.client_name}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {record.client_email && (
                                  <div className="text-muted-foreground">{record.client_email}</div>
                                )}
                                {record.client_mobile && (
                                  <div>{record.client_mobile}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{record.client_location}</TableCell>
                            <TableCell>
                              <span className="capitalize">{record.record_type}</span>
                            </TableCell>
                            <TableCell>
                              {format(new Date(record.created_date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {record.status}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSelectRecord(record)}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No records found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConvertRecordDialog;
