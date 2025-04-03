
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
  const [isLoading, setIsLoading] = useState(false);
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
      console.log("Fetched records:", data); // Log fetched data for debugging
      setRecords(data);
    } catch (error) {
      console.error("Error fetching convertible records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RecordsList
      records={records}
      isLoading={isLoading}
      onSelectRecord={onSelectRecord}
    />
  );
};

export default RecordsListView;
