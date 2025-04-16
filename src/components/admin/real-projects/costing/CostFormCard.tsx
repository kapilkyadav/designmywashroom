
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AddCostItemForm from './AddCostItemForm';
import { CostItem } from './types';

interface CostFormCardProps {
  onAddItem: (item: CostItem) => void;
}

const CostFormCard: React.FC<CostFormCardProps> = ({ onAddItem }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <AddCostItemForm onAddItem={onAddItem} />
      </CardContent>
    </Card>
  );
};

export default CostFormCard;
