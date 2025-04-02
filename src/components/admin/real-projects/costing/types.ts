
export interface CostItem {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: 'execution' | 'vendor' | 'additional';
}
