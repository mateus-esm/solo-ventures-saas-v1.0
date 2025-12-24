import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { lead_id, content, type = 'text', media_url, sender_id } = await req.json()

    console.log('Received message request:', { lead_id, content, type, media_url })

    // 1. Validate lead exists
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, phone, equipe_id')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      console.error('Lead not found:', leadError)
      throw new Error('Lead não encontrado')
    }

    // 2. Save message to database
    const { data: msg, error: msgError } = await supabase
      .from('messages')
      .insert({
        lead_id,
        content,
        sender_type: 'agent',
        sender_id,
        media_url,
        media_type: type
      })
      .select()
      .single()

    if (msgError) {
      console.error('Error inserting message:', msgError)
      throw msgError
    }

    console.log('Message saved:', msg)

    // 3. Update lead's last_message_at to reorder in list
    const { error: updateError } = await supabase
      .from('leads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', lead_id)

    if (updateError) {
      console.error('Error updating lead last_message_at:', updateError)
    }

    // 4. Optional: Send to GPT Maker API when configured
    const gptMakerToken = Deno.env.get('GPT_MAKER_API_TOKEN')
    if (gptMakerToken && lead.phone) {
      try {
        console.log('Sending message to GPT Maker for phone:', lead.phone)
        const gptResponse = await fetch('https://app.gptmaker.ai/api/v1/chat/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${gptMakerToken}`
          },
          body: JSON.stringify({
            number: lead.phone,
            message: content,
            type: type,
            url: media_url
          })
        })

        if (!gptResponse.ok) {
          const errorText = await gptResponse.text()
          console.error('GPT Maker API error:', errorText)
        } else {
          console.log('Message sent to GPT Maker successfully')
        }
      } catch (gptError) {
        console.error('Error calling GPT Maker API:', gptError)
        // Don't throw - message is already saved locally
      }
    }

    return new Response(JSON.stringify(msg), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in send-chat-message:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
