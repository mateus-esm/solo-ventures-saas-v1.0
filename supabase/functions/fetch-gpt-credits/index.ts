import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Get user's team and agent ID
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('equipe_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      throw new Error('Profile not found');
    }

    const { data: equipe } = await supabaseClient
      .from('equipes')
      .select('gpt_maker_agent_id')
      .eq('id', profile.equipe_id)
      .single();

    if (!equipe?.gpt_maker_agent_id) {
      return new Response(
        JSON.stringify({ error: 'GPT Maker Agent ID not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const gptMakerToken = Deno.env.get('GPT_MAKER_API_TOKEN');
    if (!gptMakerToken) {
      throw new Error('GPT Maker API token not configured');
    }

    // Get current date for filtering
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Fetch credits spent
    const creditsSpentUrl = `https://api.gptmaker.ai/v2/agent/${equipe.gpt_maker_agent_id}/credits-spent?year=${year}&month=${month}`;
    const creditsSpentResponse = await fetch(creditsSpentUrl, {
      headers: {
        'Authorization': `Bearer ${gptMakerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!creditsSpentResponse.ok) {
      const errorText = await creditsSpentResponse.text();
      console.error('GPT Maker credits-spent error:', creditsSpentResponse.status, errorText);
      throw new Error(`Failed to fetch credits spent: ${creditsSpentResponse.status}`);
    }

    const creditsSpentData = await creditsSpentResponse.json();

    // Fetch credits balance
    const creditsBalanceUrl = 'https://api.gptmaker.ai/v2/agent/credits-balance';
    const creditsBalanceResponse = await fetch(creditsBalanceUrl, {
      headers: {
        'Authorization': `Bearer ${gptMakerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!creditsBalanceResponse.ok) {
      const errorText = await creditsBalanceResponse.text();
      console.error('GPT Maker credits-balance error:', creditsBalanceResponse.status, errorText);
      throw new Error(`Failed to fetch credits balance: ${creditsBalanceResponse.status}`);
    }

    const creditsBalanceData = await creditsBalanceResponse.json();

    // Store consumption in database
    const periodo = `${year}-${month.toString().padStart(2, '0')}`;
    const creditsSpent = creditsSpentData.total_credits_spent || 0;

    await supabaseClient
      .from('consumo_creditos')
      .upsert({
        equipe_id: profile.equipe_id,
        creditos_utilizados: creditsSpent,
        periodo: periodo,
        metadata: creditsSpentData,
      }, {
        onConflict: 'equipe_id,periodo',
        ignoreDuplicates: false,
      });

    return new Response(
      JSON.stringify({
        creditsSpent: creditsSpent,
        creditsBalance: creditsBalanceData.balance || 0,
        periodo: periodo,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-gpt-credits:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
