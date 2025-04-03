
import React, { useState, useEffect } from 'react';
import { RealProjectService, ConvertibleRecord } from '@/services/RealProjectService';
import RecordsList from './RecordsList';
import LoadingIndicator from './LoadingIndicator';

interface RecordsListViewProps {
  onSelectRecord: (record: ConvertibleRecord) => void;
  onCreateDirect: () => void;
  onCancel: () => void;
}

const RecordsListView: React.FC<RecordsListViewProps> = ({
  onSelectRecord,
  onCreateDirect,
  onCancel
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
      setRecords(data);
    } catch (error) {
      console.error("Error fetching convertible records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <RecordsList
      records={records}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onSelectRecord={onSelectRecord}
      onCreateDirect={onCreateDirect}
      onCancel={onCancel}
    />
  );
};

export default RecordsListView;
