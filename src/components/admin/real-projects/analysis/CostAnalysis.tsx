
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CostAnalysisProps {
  executionCosts: number;
  productCosts: number;
  logisticsCosts: number;
  marginPercentage: number;
  gstRate: number;
}

export default function CostAnalysis({
  executionCosts,
  productCosts,
  logisticsCosts,
  marginPercentage,
  gstRate
}: CostAnalysisProps) {
  // Calculate totals
  const subtotal = executionCosts + productCosts + logisticsCosts;
  const margin = subtotal * (marginPercentage / 100);
  const priceWithMargin = subtotal + margin;
  const gst = priceWithMargin * (gstRate / 100);
  const grandTotal = priceWithMargin + gst;
  
  // Calculate profitability
  const profitMargin = (margin / subtotal) * 100;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Execution Costs</TableCell>
                <TableCell className="text-right">₹{executionCosts.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Product Costs</TableCell>
                <TableCell className="text-right">₹{productCosts.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Logistics Costs</TableCell>
                <TableCell className="text-right">₹{logisticsCosts.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Margin ({marginPercentage}%)</TableCell>
                <TableCell className="text-right">₹{margin.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>GST ({gstRate}%)</TableCell>
                <TableCell className="text-right">₹{gst.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>Grand Total</TableCell>
                <TableCell className="text-right">₹{grandTotal.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Profitability Analysis</h3>
            <p>Profit Margin: {profitMargin.toFixed(2)}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
