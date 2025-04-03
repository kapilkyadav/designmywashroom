
import React from 'react';
import { ConvertibleRecord } from '@/services/RealProjectService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Phone, Mail, MapPin, Calendar } from 'lucide-react';

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
      record.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      record.client_mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.client_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'leads') return matchesSearch && record.record_type === 'lead';
    if (activeTab === 'estimates') return matchesSearch && (record.record_type === 'project_estimate' || record.record_type === 'estimate');
    
    return matchesSearch;
  });

  return (
    <div className="py-4">
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Records</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-4">
        <Button onClick={onCreateDirect} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create New Project Directly
        </Button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div
              key={record.record_id}
              className="p-4 border rounded-md cursor-pointer hover:bg-accent"
              onClick={() => onSelectRecord(record)}
            >
              <div className="flex justify-between mb-2">
                <h3 className="font-medium">{record.client_name}</h3>
                <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                  {record.record_type === 'lead' ? 'Lead' : 'Estimate'}
                </span>
              </div>
              
              <div className="text-sm space-y-1 text-muted-foreground">
                {record.client_mobile && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{record.client_mobile}</span>
                  </div>
                )}
                {record.client_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{record.client_email}</span>
                  </div>
                )}
                {record.client_location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{record.client_location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(record.created_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No records found matching your search
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default RecordsList;
