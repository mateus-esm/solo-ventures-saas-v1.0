import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  agent_id: string;
  interaction_id: string;
  nome?: string;
  email?: string;
  telefone?: string;
  mensagem?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: WebhookPayload = await req.json();
    console.log('Webhook received:', JSON.stringify(payload));

    // Validate required fields
    if (!payload.agent_id) {
      console.error('Missing agent_id');
      return new Response(
        JSON.stringify({ error: 'agent_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find equipe by gpt_maker_agent_id
    const { data: equipe, error: equipeError } = await supabase
      .from('equipes')
      .select('id, nome_cliente')
      .eq('gpt_maker_agent_id', payload.agent_id)
      .maybeSingle();

    if (equipeError) {
      console.error('Error finding equipe:', equipeError);
      return new Response(
        JSON.stringify({ error: 'Database error finding equipe' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!equipe) {
      console.error('No equipe found for agent_id:', payload.agent_id);
      return new Response(
        JSON.stringify({ error: 'Agent not registered' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found equipe:', equipe.nome_cliente);

    // Get default stage for this equipe
    const { data: defaultStage, error: stageError } = await supabase
      .from('pipeline_stages')
      .select('id')
      .eq('equipe_id', equipe.id)
      .eq('is_default', true)
      .maybeSingle();

    if (stageError) {
      console.error('Error finding default stage:', stageError);
    }

    // Insert lead
    const leadData = {
      equipe_id: equipe.id,
      stage_id: defaultStage?.id || null,
      nome: payload.nome || 'Lead via Agente',
      email: payload.email || null,
      telefone: payload.telefone || null,
      origem: 'agente_sdr',
      atendido_por_agente: true,
      interaction_id: payload.interaction_id || null,
      tags: payload.tags || [],
      observacoes: payload.mensagem || null,
      custom_fields: payload.custom_fields || {},
    };

    console.log('Inserting lead:', JSON.stringify(leadData));

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (leadError) {
      console.error('Error inserting lead:', leadError);
      return new Response(
        JSON.stringify({ error: 'Failed to create lead', details: leadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Lead created:', lead.id);

    // Create initial activity
    const { error: activityError } = await supabase
      .from('lead_activities')
      .insert({
        lead_id: lead.id,
        tipo: 'webhook',
        descricao: 'Lead recebido via agente SDR',
        metadata: { 
          interaction_id: payload.interaction_id,
          agent_id: payload.agent_id 
        },
      });

    if (activityError) {
      console.error('Error creating activity:', activityError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: lead.id,
        message: 'Lead created successfully' 
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
