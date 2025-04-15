
import React, { useState, useEffect } from 'react';
import { ConvertibleRecord } from '@/services/real-projects/types';
import { RealProjectService } from '@/services/RealProjectService';
import RecordsList from './RecordsList';
import LoadingIndicator from './LoadingIndicator';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecordsListViewProps {
  selectedRecord: ConvertibleRecord | null;
  recordType: 'lead' | 'project_estimate';
  onSelectRecord: (record: ConvertibleRecord) => void;
  onChangeRecordType: (type: string) => void;
  onCreateDirect?: () => void;
  onCancel?: () => void;
}

const RecordsListView: React.FC<RecordsListViewProps> = ({
  selectedRecord,
  recordType,
  onSelectRecord,
  onChangeRecordType,
  onCreateDirect,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<ConvertibleRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch convertible records when component mounts
  useEffect(() => {
    fetchRecords();
  }, []);

  // Fetch records from API
  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await RealProjectService.getConvertibleRecords();
      console.log("Fetched convertible records:", data); // Add logging
      setRecords(data || []);
    } catch (error: any) {
      console.error("Error fetching convertible records:", error);
      setError(error.message || "Failed to load records");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records based on search term and active tab
  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.client_mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.client_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'leads' && record.record_type === 'lead') ||
      (activeTab === 'estimates' && record.record_type === 'project_estimate');
    
    return matchesSearch && matchesTab;
  });

  const handleRetry = () => {
    fetchRecords();
  };

  // Show error state
  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h3 className="text-lg font-medium">Error Loading Records</h3>
        <p className="text-muted-foreground">{error}</p>
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleRetry}>Retry</Button>
          {onCreateDirect && (
            <Button variant="secondary" onClick={onCreateDirect}>Create Directly</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <LoadingIndicator message="Loading convertible records..." />
      ) : (
        <RecordsList
          records={filteredRecords}
          isLoading={isLoading}
          onSelectRecord={onSelectRecord}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCreateDirect={onCreateDirect}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};

export default RecordsListView;
