
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { CostItem } from './types';

interface CostTableProps {
  items: CostItem[];
  title: string;
  description: string;
  onRemoveItem: (id: string) => void;
}

const CostTable: React.FC<CostTableProps> = ({
  items,
  title,
  description,
  onRemoveItem
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Total: ₹{items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
        </Badge>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount (₹)</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                  No items added
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell>
                    {item.description || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CostTable;
