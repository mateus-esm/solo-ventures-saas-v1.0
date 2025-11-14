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

    // Get user's team
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
      .select('jestor_api_token')
      .eq('id', profile.equipe_id)
      .single();

    if (!equipe?.jestor_api_token) {
      return new Response(
        JSON.stringify({ error: 'Jestor API token not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const jestorToken = equipe.jestor_api_token;

    // Get current month for filtering
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodo = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    // Fetch leads data from Jestor
    // Note: Adjust the object_type and field names according to your Jestor configuration
    const leadsResponse = await fetch('https://api.jestor.com/api/object/list', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jestorToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object_type: 'leads', // Adjust this to your Jestor table name
        filters: [
          {
            field: 'created_at',
            operator: '>=',
            value: firstDayOfMonth.toISOString(),
          }
        ],
      }),
    });

    if (!leadsResponse.ok) {
      const errorText = await leadsResponse.text();
      console.error('Jestor API error:', leadsResponse.status, errorText);
      throw new Error(`Failed to fetch Jestor data: ${leadsResponse.status}`);
    }

    const leadsData = await leadsResponse.json();

    // Calculate KPIs from the data
    // Adjust these calculations based on your actual Jestor data structure
    const leads = leadsData.data || [];
    const leadsAtendidos = leads.length;
    const reunioesAgendadas = leads.filter((lead: any) => lead.status === 'reuniao_agendada').length;
    const negociosFechados = leads.filter((lead: any) => lead.status === 'negocio_fechado').length;
    const valorTotalNegocios = leads
      .filter((lead: any) => lead.status === 'negocio_fechado')
      .reduce((sum: number, lead: any) => sum + (parseFloat(lead.valor) || 0), 0);

    // Store KPIs in database
    await supabaseClient
      .from('kpis_dashboard')
      .upsert({
        equipe_id: profile.equipe_id,
        leads_atendidos: leadsAtendidos,
        reunioes_agendadas: reunioesAgendadas,
        negocios_fechados: negociosFechados,
        valor_total_negocios: valorTotalNegocios,
        periodo: periodo,
      }, {
        onConflict: 'equipe_id,periodo',
        ignoreDuplicates: false,
      });

    return new Response(
      JSON.stringify({
        leadsAtendidos,
        reunioesAgendadas,
        negociosFechados,
        valorTotalNegocios,
        taxaConversaoReuniao: leadsAtendidos > 0 ? ((reunioesAgendadas / leadsAtendidos) * 100).toFixed(1) : 0,
        taxaConversaoNegocio: reunioesAgendadas > 0 ? ((negociosFechados / reunioesAgendadas) * 100).toFixed(1) : 0,
        periodo,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-jestor-kpis:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
