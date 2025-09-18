import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatIndianCurrency } from '@/lib/utils';

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  ward: number;
  year: number;
}

interface BudgetTableProps {
  budgetData: BudgetItem[];
  department: string;
}

const BudgetTable: React.FC<BudgetTableProps> = ({ budgetData, department }) => {
  // Filter out invalid data and ensure we have numeric amounts
  const validBudgetData = budgetData.filter(item => 
    item && 
    item.category && 
    !isNaN(Number(item.amount)) && 
    Number(item.amount) > 0
  );

  const totalBudget = validBudgetData.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Data - {department}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            Municipal budget allocation by category
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validBudgetData.length > 0 ? (
              validBudgetData.map((item) => {
                const amount = Number(item.amount);
                const percentage = totalBudget > 0 ? ((amount / totalBudget) * 100).toFixed(1) : '0.0';
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.category}</TableCell>
                    <TableCell className="text-right">{formatIndianCurrency(amount)}</TableCell>
                    <TableCell className="text-right">{percentage}%</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No valid budget data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BudgetTable;