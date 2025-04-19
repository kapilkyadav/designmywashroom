
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface InternalAnalysisProps {
  executionCosts: number;
  productCosts: number;
  marginPercentage: number;
  gstRate: number;
  logisticsCosts: number;
}

export default function InternalAnalysis({
  executionCosts,
  productCosts,
  marginPercentage,
  gstRate,
  logisticsCosts
}: InternalAnalysisProps) {
  const baseTotal = executionCosts + productCosts + logisticsCosts;
  const marginAmount = baseTotal * (marginPercentage / 100);
  const totalWithMargin = baseTotal + marginAmount;
  const gstAmount = totalWithMargin * (gstRate / 100);
  const grandTotal = totalWithMargin + gstAmount;
  
  const profitMargin = (marginAmount / baseTotal) * 100;
  const costBreakdownPercentage = {
    execution: (executionCosts / baseTotal) * 100,
    products: (productCosts / baseTotal) * 100,
    logistics: (logisticsCosts / baseTotal) * 100
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Internal Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Base Costs Breakdown</p>
              <div className="flex items-center justify-between">
                <span>Execution Services</span>
                <span>{costBreakdownPercentage.execution.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Products</span>
                <span>{costBreakdownPercentage.products.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Logistics</span>
                <span>{costBreakdownPercentage.logistics.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold">
                  {profitMargin >= 0 ? 
                    <ArrowUpRight className="text-green-500" /> : 
                    <ArrowDownRight className="text-red-500" />
                  }
                </span>
                <span className="text-2xl font-bold">
                  {Math.abs(profitMargin).toFixed(1)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Profit Margin</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cost Component</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Execution Costs</TableCell>
                <TableCell className="text-right">{executionCosts.toLocaleString('en-IN')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Product Costs</TableCell>
                <TableCell className="text-right">{productCosts.toLocaleString('en-IN')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Logistics Costs</TableCell>
                <TableCell className="text-right">{logisticsCosts.toLocaleString('en-IN')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Base Total</TableCell>
                <TableCell className="text-right">{baseTotal.toLocaleString('en-IN')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Margin ({marginPercentage}%)</TableCell>
                <TableCell className="text-right">{marginAmount.toLocaleString('en-IN')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total with Margin</TableCell>
                <TableCell className="text-right">{totalWithMargin.toLocaleString('en-IN')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>GST ({gstRate}%)</TableCell>
                <TableCell className="text-right">{gstAmount.toLocaleString('en-IN')}</TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>Grand Total</TableCell>
                <TableCell className="text-right">{grandTotal.toLocaleString('en-IN')}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
