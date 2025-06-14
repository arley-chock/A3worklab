import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders } from '../_shared/cors.ts'
import { sendConfirmation } from '../_shared/twilio.ts'

interface ReservationRequest {
  resource_id: string
  starts_at: string
  ends_at: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { resource_id, starts_at, ends_at } = await req.json() as ReservationRequest
    const user_id = req.headers.get('x-user-id')

    if (!user_id) {
      throw new Error('User not authenticated')
    }

    // Check if resource exists and get its restrictions
    const { data: resource, error: resourceError } = await supabaseClient
      .from('resources')
      .select('*')
      .eq('id', resource_id)
      .single()

    if (resourceError || !resource) {
      throw new Error('Resource not found')
    }

    // Check for time conflicts using GIST index
    const { data: conflicts, error: conflictError } = await supabaseClient
      .from('reservations')
      .select('id')
      .eq('resource_id', resource_id)
      .eq('status', 'active')
      .filter('starts_at', 'lt', ends_at)
      .filter('ends_at', 'gt', starts_at)

    if (conflictError) {
      throw new Error('Error checking for conflicts')
    }

    if (conflicts && conflicts.length > 0) {
      throw new Error('Time slot already reserved')
    }

    // Apply resource restrictions
    const restrictions = resource.restrictions || {}
    if (restrictions.max_duration) {
      const duration = new Date(ends_at).getTime() - new Date(starts_at).getTime()
      const maxDuration = restrictions.max_duration * 60 * 60 * 1000 // Convert hours to milliseconds
      if (duration > maxDuration) {
        throw new Error(`Reservation exceeds maximum duration of ${restrictions.max_duration} hours`)
      }
    }

    // Create reservation
    const { data: reservation, error: reservationError } = await supabaseClient
      .from('reservations')
      .insert({
        resource_id,
        user_id,
        starts_at,
        ends_at,
        status: 'active'
      })
      .select()
      .single()

    if (reservationError) {
      throw new Error('Error creating reservation')
    }

    // Log the action
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id,
        action: 'create_reservation',
        data: { reservation_id: reservation.id }
      })

    // Send confirmation via Twilio
    await sendConfirmation(reservation.id)

    return new Response(
      JSON.stringify({ data: reservation }),
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