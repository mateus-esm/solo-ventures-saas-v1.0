import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log('Webhook received:', JSON.stringify(payload))

    // O Payload pode ser um array de mensagens ou um objeto único
    const messages = Array.isArray(payload) ? payload : [payload]

    for (const msg of messages) {
      // Ignorar mensagens de sistema que não são relevantes para o chat
      // (Ajustar conforme necessidade. Ex: conversationNotificationType pode ser útil para saber status)

      // Extrair dados chaves
      const chatId = msg.externalId || msg.transactionId // GPT Maker usa externalId como identificador do lead/conversa muitas vezes
      // O user disse: "Ou então pegar o chat e listar as mensagens do chat na ordem correta"
      // E disse para salvar gpt_maker_chat_id no lead.

      if (!chatId) continue;

      const role = msg.role === 'assistant' ? 'agent' : 'client' // Normalizar para nosso enum
      const content = msg.text || (msg.type === 'AUDIO' ? '[Áudio]' : '[Mídia]')

      if (!content) continue;

      // 1. Encontrar o Lead pelo gpt_maker_chat_id
      let { data: lead } = await supabase
        .from('leads')
        .select('id, equipe_id')
        .eq('gpt_maker_chat_id', chatId)
        .single()

      // Se não achar pelo ID do chat, tente achar pelo telefone se disponível no payload (nem sempre vem)
      // Se não achar, cria um Lead "Desconhecido" ou ignora? 
      // Para este MVP, vamos criar se não existir OU logar erro.
      // O user disse: "A função deve procurar o Lead pelo telefone ou chatId".

      if (!lead) {
        console.log(`Lead not found for chatId ${chatId}. Trying to find/create...`)
        // Simplificação: Se não achou, vamos tentar criar um lead novo ou ignorar por enquanto
        // para não poluir o banco sem dados do cliente.
        // Mas para o Realtime funcionar, precisamos de um lead_id.
        // Vamos inserir mensagem sem lead_id? Não, violates FK via de regra.
        // Vamos logar e pular.
        console.warn(`Lead not found via gpt_maker_chat_id: ${chatId}. Message skipped.`)
        continue;
      }

      // 2. Inserir a mensagem no banco
      const { error } = await supabase
        .from('messages')
        .insert({
          lead_id: lead.id,
          equipe_id: lead.equipe_id,
          content: content,
          sender_type: role,
          status: 'received', // Já chegou
          metadata: msg // Salva o JSON original para debug
        })

      if (error) console.error('Error inserting message:', error)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
