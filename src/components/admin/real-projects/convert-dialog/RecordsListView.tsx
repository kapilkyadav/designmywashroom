
import React, { useState, useEffect } from 'react';
import { ConvertibleRecord } from '@/services/real-projects/types';
import { RealProjectService } from '@/services/RealProjectService';
import RecordsList from './RecordsList';
import LoadingIndicator from './LoadingIndicator';

interface RecordsListViewProps {
  selectedRecord: ConvertibleRecord | null;
  recordType: 'lead' | 'project_estimate';
  onSelectRecord: (record: ConvertibleRecord) => void;
  onChangeRecordType: (type: string) => void;
}

const RecordsListView: React.FC<RecordsListViewProps> = ({
  selectedRecord,
  recordType,
  onSelectRecord,
  onChangeRecordType
}) => {
  const [isLoading, setIsLoading] = useState(true);
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
    try {
      const data = await RealProjectService.getConvertibleRecords();
      console.log("Fetched convertible records:", data); // Add logging
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching convertible records:", error);
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

  return (
    <div className="space-y-4">
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <RecordsList
          records={records}
          isLoading={isLoading}
          onSelectRecord={onSelectRecord}
        />
      )}
    </div>
  );
};

export default RecordsListView;
