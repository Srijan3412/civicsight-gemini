import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DepartmentSelector from '@/components/budget/DepartmentSelector';

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  ward: number;
  year: number;
}

const Insights = () => {
  const [department, setDepartment] = useState('');
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const { toast } = useToast();

  const fetchBudgetData = async () => {
    if (!department) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a department first.",
      });
      return;
    }

    setFetchingData(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-budget', {
        body: { department }
      });

      if (error) throw error;

      setBudgetData(data.budgetData || []);
      
      toast({
        title: "Data Loaded",
        description: `Found ${data.budgetData?.length || 0} budget items for ${department}.`,
      });
    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: "Failed to fetch budget data. Please try again.",
      });
    } finally {
      setFetchingData(false);
    }
  };

  const generateInsights = async () => {
    if (!budgetData || budgetData.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "Please fetch budget data first before analyzing.",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-ai-insights', {
        body: {
          budgetData,
          department
        }
      });

      if (error) throw error;

      setInsights(data.insights);
      toast({
        title: "AI Analysis Complete",
        description: "Generated insights for your budget data.",
      });
    } catch (error) {
      console.error('Error getting AI insights:', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Failed to generate AI insights. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseInsights = (insightsText: string) => {
    const lines = insightsText.split('\n').filter(line => line.trim());
    
    return {
      summary: lines.slice(0, 3),
      anomalies: lines.filter(line => 
        line.toLowerCase().includes('anomal') || 
        line.toLowerCase().includes('unusual') ||
        line.toLowerCase().includes('overspend')
      ),
      suggestions: lines.filter(line => 
        line.toLowerCase().includes('suggest') ||
        line.toLowerCase().includes('recommend') ||
        line.toLowerCase().includes('optim')
      )
    };
  };

  const parsedInsights = insights ? parseInsights(insights) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">AI-Powered Budget Insights</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get intelligent analysis of municipal budget data with AI-driven insights, 
            anomaly detection, and optimization recommendations.
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <DepartmentSelector value={department} onChange={setDepartment} />
              <Button 
                onClick={fetchBudgetData} 
                disabled={fetchingData || !department}
                variant="outline"
              >
                {fetchingData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load Budget Data
              </Button>
              <Button 
                onClick={generateInsights} 
                disabled={loading || budgetData.length === 0}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Brain className="mr-2 h-4 w-4" />
                Generate AI Insights
              </Button>
            </div>
            {budgetData.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Loaded {budgetData.length} budget items for {department}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Insights Display */}
        {parsedInsights && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Key Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {parsedInsights.summary.map((line, index) => (
                    <p key={index} className="text-sm text-foreground">{line}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Anomalies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Anomalies Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {parsedInsights.anomalies.length > 0 ? (
                    parsedInsights.anomalies.map((line, index) => (
                      <p key={index} className="text-sm text-foreground">{line}</p>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No anomalies detected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Optimization Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {parsedInsights.suggestions.length > 0 ? (
                    parsedInsights.suggestions.map((line, index) => (
                      <p key={index} className="text-sm text-foreground">{line}</p>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No suggestions available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Insights */}
        {insights && (
          <Card>
            <CardHeader>
              <CardTitle>Complete AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-accent/20 rounded-lg p-4 border border-accent">
                <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {insights}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!insights && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Insights Generated Yet</h3>
              <p className="text-muted-foreground">
                Select a department, load budget data, then generate AI insights to see intelligent analysis.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Insights;