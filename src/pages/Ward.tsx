import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, MapPin, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SummaryCards from '@/components/budget/SummaryCards';
import BudgetTable from '@/components/budget/BudgetTable';
import BudgetChart from '@/components/budget/BudgetChart';
import AiInsights from '@/components/budget/AiInsights';
import WardSelector from '@/components/budget/WardSelector';

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  ward: number;
  year: number;
}

interface BudgetSummary {
  totalBudget: number;
  largestCategory: {
    category: string;
    amount: number;
  } | null;
  yearOverYearChange: number;
}

const Ward = () => {
  const [ward, setWard] = useState('all');
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const fetchWardData = async () => {
    if (ward === 'all') {
      toast({
        variant: "destructive",
        title: "Ward Required",
        description: "Please select a specific ward to view data.",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-budget', {
        body: {
          department: 'all', // Get all departments for the selected ward
          ward: ward
        }
      });

      if (error) {
        throw error;
      }

      setBudgetData(data.budgetData || []);
      setSummary(data.summary || null);
      
      toast({
        title: "Ward Data Loaded",
        description: `Found ${data.budgetData?.length || 0} budget items for Ward ${ward}.`,
      });
    } catch (error) {
      console.error('Error fetching ward data:', error);
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: "Failed to fetch ward data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Ward Analysis</h1>
            <p className="text-muted-foreground">Explore budget allocation across municipal wards</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="mb-8">
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                Ward Budget Explorer
              </CardTitle>
              <p className="text-muted-foreground">Select a ward to analyze budget allocation and spending across all departments.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                  <WardSelector value={ward} onChange={setWard} />
                </div>
                <div className="md:col-span-1">
                  <Button 
                    onClick={fetchWardData} 
                    disabled={loading || ward === 'all'}
                    className="w-full bg-gradient-primary hover:opacity-90 shadow-md"
                    size="lg"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Search className="mr-2 h-4 w-4" />
                    {loading ? 'Loading...' : 'Analyze Ward'}
                  </Button>
                </div>
                <div className="md:col-span-1">
                  <Button asChild variant="outline" size="lg" className="w-full hover-scale">
                    <Link to="/dashboard">
                      <MapPin className="mr-2 h-4 w-4" />
                      Department View
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="animate-fade-in">
            <SummaryCards summary={summary} />
          </div>
        )}

        {/* Main Content Grid */}
        {budgetData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in">
            <BudgetTable budgetData={budgetData} department={`Ward ${ward}`} />
            <BudgetChart budgetData={budgetData} />
          </div>
        )}

        {/* AI Insights */}
        <div className="animate-fade-in">
          <AiInsights budgetData={budgetData} department={`Ward ${ward}`} />
        </div>

        {/* Empty State */}
        {!summary && !loading && (
          <Card className="bg-gradient-card border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Ward Budget Analysis</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto mb-6">
                Select a ward from the dropdown above and click "Analyze Ward" to view comprehensive budget insights for that ward.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline" size="lg" className="hover-scale">
                  <Link to="/dashboard">
                    <Search className="mr-2 h-4 w-4" />
                    Department Analysis
                  </Link>
                </Button>
                <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90">
                  <Link to="/insights">
                    <Brain className="mr-2 h-4 w-4" />
                    AI Insights
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Ward;