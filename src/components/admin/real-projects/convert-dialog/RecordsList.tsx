
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ConvertibleRecord } from '@/services/RealProjectService';

interface RecordsListProps {
  records: ConvertibleRecord[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectRecord: (record: ConvertibleRecord) => void;
  onCreateDirect: () => void;
  onCancel: () => void;
}

const RecordsList: React.FC<RecordsListProps> = ({
  records,
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  onSelectRecord,
  onCreateDirect,
  onCancel
}) => {
  // Filter records based on search term and active tab
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      (record.client_name && record.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.client_email && record.client_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.client_mobile && record.client_mobile.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.client_location && record.client_location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'leads' && record.record_type === 'lead') ||
      (activeTab === 'estimates' && record.record_type === 'project_estimate');
    
    return matchesSearch && matchesTab;
  });

  // Helper function to format contact info
  const hasContactInfo = (record: ConvertibleRecord) => {
    return !!(record.client_email || record.client_mobile);
  };

  return (
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
        <Button onClick={onCreateDirect}>
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
                      <TableCell className="font-medium">{record.client_name || "N/A"}</TableCell>
                      <TableCell>
                        {hasContactInfo(record) ? (
                          <div className="flex flex-col space-y-1">
                            {record.client_email && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Email:</span> {record.client_email}
                              </div>
                            )}
                            {record.client_mobile && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Mobile:</span> {record.client_mobile}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No contact info</div>
                        )}
                      </TableCell>
                      <TableCell>{record.client_location || "N/A"}</TableCell>
                      <TableCell>
                        <span className="capitalize">{record.record_type}</span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.created_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {record.status || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectRecord(record)}
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
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default RecordsList;
