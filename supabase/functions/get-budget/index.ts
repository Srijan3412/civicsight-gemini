import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { department } = await req.json();

    console.log(`Fetching budget data for department: ${department}`);

    // Validate inputs
    if (!department) {
      return new Response(
        JSON.stringify({ error: 'Department is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch budget data
    const { data: budgetData, error } = await supabase
      .from('municipal_budget')
      .select('*')
      .eq('account', department)
      .order('used_amt', { ascending: false });

    if (error) {
      console.error('Error fetching budget data:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch budget data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate summary statistics
    const totalBudget = budgetData.reduce((sum, item) => sum + Number(item.used_amt || 0), 0);
    const totalAllocated = budgetData.reduce((sum, item) => sum + Number(item.account_budget_a || 0), 0);
    const largestItem = budgetData[0]; // Already sorted by used_amt desc

    const response = {
      budgetData,
      summary: {
        totalBudget: totalAllocated,
        totalUsed: totalBudget,
        largestCategory: largestItem ? {
          category: largestItem.account_budget_a,
          amount: largestItem.used_amt
        } : null,
        utilizationRate: totalAllocated > 0 ? Math.round((totalBudget / totalAllocated) * 100) : 0
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-budget function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});