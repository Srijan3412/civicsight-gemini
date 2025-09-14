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

    const { ward, year } = await req.json();

    console.log(`Fetching budget data for ward: ${ward}, year: ${year}`);

    // Validate inputs
    if (!ward || !year) {
      return new Response(
        JSON.stringify({ error: 'Ward and year are required' }),
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
      .eq('ward', ward)
      .eq('year', year)
      .order('amount', { ascending: false });

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
    const totalBudget = budgetData.reduce((sum, item) => sum + Number(item.amount), 0);
    const largestCategory = budgetData[0]; // Already sorted by amount desc

    // Get previous year data for comparison
    const { data: previousYearData } = await supabase
      .from('municipal_budget')
      .select('*')
      .eq('ward', ward)
      .eq('year', year - 1);

    let yearOverYearChange = 0;
    if (previousYearData && previousYearData.length > 0) {
      const previousTotal = previousYearData.reduce((sum, item) => sum + Number(item.amount), 0);
      yearOverYearChange = ((totalBudget - previousTotal) / previousTotal) * 100;
    }

    const response = {
      budgetData,
      summary: {
        totalBudget,
        largestCategory: largestCategory ? {
          category: largestCategory.category,
          amount: largestCategory.amount
        } : null,
        yearOverYearChange: Math.round(yearOverYearChange * 100) / 100
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