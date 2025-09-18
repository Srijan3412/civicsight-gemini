import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatIndianCurrency, formatCompactNumber } from '@/lib/utils';

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  ward: number;
  year: number;
}

interface BudgetChartProps {
  budgetData: BudgetItem[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

const BudgetChart: React.FC<BudgetChartProps> = ({ budgetData }) => {
  // Filter out invalid data and ensure we have numeric amounts
  const validBudgetData = budgetData.filter(item => 
    item && 
    item.category && 
    !isNaN(Number(item.amount)) && 
    Number(item.amount) > 0
  );

  const chartData = validBudgetData.map((item) => ({
    category: item.category,
    amount: Number(item.amount),
  }));

  // Sort data for better visualization and get top 8 for pie chart
  const sortedData = [...chartData].sort((a, b) => b.amount - a.amount);
  const topData = sortedData.slice(0, 8);
  const othersAmount = sortedData.slice(8).reduce((sum, item) => sum + item.amount, 0);
  
  const pieData = othersAmount > 0 
    ? [...topData, { category: 'Others', amount: othersAmount }]
    : topData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar" className="mt-6">
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={chartData} margin={{ left: 90, right: 30, top: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  fontSize={10}
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  tickFormatter={formatCompactNumber} 
                  width={75}
                />
                <Tooltip 
                  formatter={(value: number) => [formatIndianCurrency(value), 'Amount']}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="pie" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      label={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatIndianCurrency(value), 'Amount']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => `${value}`}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Budget Breakdown</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {pieData.map((entry, index) => {
                    const total = pieData.reduce((sum, item) => sum + item.amount, 0);
                    const percentage = ((entry.amount / total) * 100).toFixed(1);
                    return (
                      <div key={entry.category} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded-sm flex-shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{entry.category}</div>
                          <div className="text-muted-foreground">
                            {formatIndianCurrency(entry.amount)} ({percentage}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BudgetChart;