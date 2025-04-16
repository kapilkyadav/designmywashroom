
import React, { useState } from 'react';
import { ProjectQuotation } from '@/services/RealProjectService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Download, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface QuotationsListProps {
  quotations: ProjectQuotation[];
  isLoading: boolean;
  onViewQuotation: (id: string) => void;
  onDownloadQuotation: (html: string, filename: string) => void;
  onDeleteQuotations: (ids: string[]) => void;
}

const QuotationsList: React.FC<QuotationsListProps> = ({
  quotations,
  isLoading,
  onViewQuotation,
  onDownloadQuotation,
  onDeleteQuotations
}) => {
  const [selectedQuotations, setSelectedQuotations] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedQuotations(new Set(quotations.map(q => q.id)));
    } else {
      setSelectedQuotations(new Set());
    }
  };

  const handleSelectQuotation = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedQuotations);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedQuotations(newSelected);
    setSelectAll(newSelected.size === quotations.length);
  };

  const handleDeleteSelected = () => {
    onDeleteQuotations(Array.from(selectedQuotations));
    setSelectedQuotations(new Set());
    setSelectAll(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (quotations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No quotations have been generated yet
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {selectedQuotations.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
          <span>{selectedQuotations.size} quotation(s) selected</span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDeleteSelected}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                aria-label="Select all quotations"
              />
            </TableHead>
            <TableHead>Quotation Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((quotation) => {
            const quotationData = quotation.quotation_data || {};
            const totalAmount = quotationData.totalAmount || 0;
            
            return (
              <TableRow key={quotation.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedQuotations.has(quotation.id)}
                    onCheckedChange={(checked) => handleSelectQuotation(quotation.id, checked as boolean)}
                    aria-label={`Select quotation ${quotation.quotation_number}`}
                  />
                </TableCell>
                <TableCell>{quotation.quotation_number}</TableCell>
                <TableCell>
                  {format(new Date(quotation.created_at), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewQuotation(quotation.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => quotation.quotation_html && 
                      onDownloadQuotation(
                        quotation.quotation_html, 
                        `quotation-${quotation.quotation_number}.pdf`
                      )
                    }
                    disabled={!quotation.quotation_html}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuotationsList;
