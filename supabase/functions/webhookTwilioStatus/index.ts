import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.formData()
    const messageSid = formData.get('MessageSid')
    const messageStatus = formData.get('MessageStatus')
    const errorCode = formData.get('ErrorCode')
    const errorMessage = formData.get('ErrorMessage')

    if (!messageSid) {
      throw new Error('MessageSid is required')
    }

    // Log the webhook
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: 'system',
        action: 'twilio_webhook',
        data: {
          message_sid: messageSid,
          message_status: messageStatus,
          error_code: errorCode,
          error_message: errorMessage
        }
      })

    // If message failed, try to send via SMS as fallback
    if (messageStatus === 'failed' && errorCode === '30008') { // WhatsApp not available
      const { data: message } = await supabaseClient
        .from('audit_logs')
        .select('data')
        .eq('data->message_sid', messageSid)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (message?.data?.to) {
        // Send SMS via Twilio
        const twilioClient = new Twilio(
          Deno.env.get('TWILIO_ACCOUNT_SID') ?? '',
          Deno.env.get('TWILIO_AUTH_TOKEN') ?? ''
        )

        await twilioClient.messages.create({
          body: message.data.body,
          to: message.data.to,
          from: Deno.env.get('TWILIO_PHONE_NUMBER')
        })
      }
    }

    return new Response(
      JSON.stringify({ message: 'Webhook processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 