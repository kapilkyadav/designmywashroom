
import React, { useState } from 'react';
import { ProjectQuotation } from '@/services/RealProjectService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Download, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuotationsListProps {
  quotations: ProjectQuotation[];
  isLoading: boolean;
  onViewQuotation: (id: string) => void;
  onDownloadQuotation: (html: string, filename: string) => void;
  onDeleteQuotations?: (ids: string[]) => void;
}

const QuotationsList: React.FC<QuotationsListProps> = ({
  quotations,
  isLoading,
  onViewQuotation,
  onDownloadQuotation,
  onDeleteQuotations
}) => {
  const [selectedQuotations, setSelectedQuotations] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = quotations.map(q => q.id);
      setSelectedQuotations(new Set(allIds));
    } else {
      setSelectedQuotations(new Set());
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedQuotations);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedQuotations(newSelection);
  };

  const handleDelete = () => {
    if (onDeleteQuotations) {
      onDeleteQuotations(Array.from(selectedQuotations));
      setSelectedQuotations(new Set());
    }
    setIsDeleteDialogOpen(false);
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
    <div>
      {selectedQuotations.size > 0 && (
        <div className="mb-4 flex items-center justify-between bg-muted/50 px-4 py-2 rounded-lg">
          <span className="text-sm">
            {selectedQuotations.size} quotation{selectedQuotations.size !== 1 ? 's' : ''} selected
          </span>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox 
                checked={selectedQuotations.size === quotations.length && quotations.length > 0}
                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                aria-label="Select all"
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
                    onCheckedChange={(checked) => handleSelect(quotation.id, checked as boolean)}
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Quotations?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedQuotations.size} selected quotation{selectedQuotations.size !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuotationsList;
