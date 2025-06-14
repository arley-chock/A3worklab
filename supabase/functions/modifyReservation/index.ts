import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { corsHeaders } from '../_shared/cors.ts'
import { sendConfirmation } from '../_shared/twilio.ts'

interface ModifyReservationRequest {
  starts_at?: string
  ends_at?: string
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

    const reservationId = req.url.split('/').pop()
    const { starts_at, ends_at } = await req.json() as ModifyReservationRequest
    const user_id = req.headers.get('x-user-id')

    if (!user_id) {
      throw new Error('User not authenticated')
    }

    if (!reservationId) {
      throw new Error('Reservation ID is required')
    }

    // Get current reservation
    const { data: currentReservation, error: currentError } = await supabaseClient
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single()

    if (currentError || !currentReservation) {
      throw new Error('Reservation not found')
    }

    // Check if user is authorized to modify this reservation
    if (currentReservation.user_id !== user_id) {
      const { data: user } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', user_id)
        .single()

      if (user?.role !== 'admin') {
        throw new Error('Not authorized to modify this reservation')
      }
    }

    // Check if reservation can be modified
    if (currentReservation.status !== 'active') {
      throw new Error('Only active reservations can be modified')
    }

    // Get resource details
    const { data: resource, error: resourceError } = await supabaseClient
      .from('resources')
      .select('*')
      .eq('id', currentReservation.resource_id)
      .single()

    if (resourceError || !resource) {
      throw new Error('Resource not found')
    }

    // Check for time conflicts
    const { data: conflicts, error: conflictError } = await supabaseClient
      .from('reservations')
      .select('id')
      .eq('resource_id', currentReservation.resource_id)
      .eq('status', 'active')
      .neq('id', reservationId)
      .filter('starts_at', 'lt', ends_at || currentReservation.ends_at)
      .filter('ends_at', 'gt', starts_at || currentReservation.starts_at)

    if (conflictError) {
      throw new Error('Error checking for conflicts')
    }

    if (conflicts && conflicts.length > 0) {
      throw new Error('Time slot already reserved')
    }

    // Apply resource restrictions
    const restrictions = resource.restrictions || {}
    if (restrictions.max_duration) {
      const duration = new Date(ends_at || currentReservation.ends_at).getTime() -
        new Date(starts_at || currentReservation.starts_at).getTime()
      const maxDuration = restrictions.max_duration * 60 * 60 * 1000 // Convert hours to milliseconds
      if (duration > maxDuration) {
        throw new Error(`Reservation exceeds maximum duration of ${restrictions.max_duration} hours`)
      }
    }

    // Update reservation
    const { data: updatedReservation, error: updateError } = await supabaseClient
      .from('reservations')
      .update({
        starts_at: starts_at || currentReservation.starts_at,
        ends_at: ends_at || currentReservation.ends_at
      })
      .eq('id', reservationId)
      .select()
      .single()

    if (updateError) {
      throw new Error('Error updating reservation')
    }

    // Log the action
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id,
        action: 'modify_reservation',
        data: {
          reservation_id: reservationId,
          old_starts_at: currentReservation.starts_at,
          old_ends_at: currentReservation.ends_at,
          new_starts_at: starts_at,
          new_ends_at: ends_at
        }
      })

    // Send confirmation via Twilio
    await sendConfirmation(reservationId)

    return new Response(
      JSON.stringify({ data: updatedReservation }),
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