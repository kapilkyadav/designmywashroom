
import React from 'react';
import { ProjectQuotation } from '@/services/RealProjectService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface QuotationsListProps {
  quotations: ProjectQuotation[];
  isLoading: boolean;
  onViewQuotation: (id: string) => void;
  onDownloadQuotation: (html: string, filename: string) => void;
}

const QuotationsList: React.FC<QuotationsListProps> = ({
  quotations,
  isLoading,
  onViewQuotation,
  onDownloadQuotation
}) => {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quotation Number</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotations.map((quotation) => {
          // Parse the quotation data to get the total amount
          const quotationData = quotation.quotation_data || {};
          const totalAmount = quotationData.totalAmount || 0;
          
          return (
            <TableRow key={quotation.id}>
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
  );
};

export default QuotationsList;
