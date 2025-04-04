
import React from 'react';
import { format } from 'date-fns';
import { Eye, Download } from 'lucide-react';
import { ProjectQuotation } from '@/services/RealProjectService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface QuotationsListProps {
  quotations: ProjectQuotation[] | undefined;
  isLoading: boolean;
  onViewQuotation: (quotationId: string) => void;
  onDownloadQuotation: (html: string, filename: string) => void;
}

const QuotationsList: React.FC<QuotationsListProps> = ({
  quotations,
  isLoading,
  onViewQuotation,
  onDownloadQuotation
}) => {
  // Helper function to safely format currency values
  const formatCurrency = (amount: any): string => {
    // Check if amount exists and is a number
    if (amount === undefined || amount === null) {
      return '₹0';
    }
    
    // Make sure it's a number before calling toLocaleString
    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    
    // Handle NaN case
    if (isNaN(numericAmount)) {
      return '₹0';
    }
    
    return `₹${numericAmount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quotation Number</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead className="text-right">Amount (₹)</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
              </TableCell>
            </TableRow>
          ) : !quotations || quotations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No quotations generated yet
              </TableCell>
            </TableRow>
          ) : (
            quotations.map((quotation) => (
              <TableRow key={quotation.id}>
                <TableCell className="font-medium">
                  {quotation.quotation_number}
                </TableCell>
                <TableCell>
                  {format(new Date(quotation.created_at), 'dd MMM yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(quotation.quotation_data?.totalAmount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => onViewQuotation(quotation.id)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => quotation.quotation_html && onDownloadQuotation(
                        quotation.quotation_html, 
                        `${quotation.quotation_number}.pdf`
                      )}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuotationsList;
