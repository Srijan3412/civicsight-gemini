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
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  
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
        <CardTitle>{t('table.category')} - {department}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {t('chart.budgetDistribution')}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.category')}</TableHead>
              <TableHead className="text-right">{t('common.amount')}</TableHead>
              <TableHead className="text-right">{t('common.percentage')}</TableHead>
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
                  {t('table.noValidData')}
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