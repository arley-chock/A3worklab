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

    const reservationId = req.url.split('/').pop()
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

    // Check if user is authorized to cancel this reservation
    if (currentReservation.user_id !== user_id) {
      const { data: user } = await supabaseClient
        .from('users')
        .select('role')
        .eq('id', user_id)
        .single()

      if (user?.role !== 'admin') {
        throw new Error('Not authorized to cancel this reservation')
      }
    }

    // Check if reservation can be cancelled
    if (currentReservation.status !== 'active') {
      throw new Error('Only active reservations can be cancelled')
    }

    // Cancel reservation
    const { data: cancelledReservation, error: cancelError } = await supabaseClient
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId)
      .select()
      .single()

    if (cancelError) {
      throw new Error('Error cancelling reservation')
    }

    // Log the action
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id,
        action: 'cancel_reservation',
        data: {
          reservation_id: reservationId,
          starts_at: currentReservation.starts_at,
          ends_at: currentReservation.ends_at
        }
      })

    return new Response(
      JSON.stringify({ data: cancelledReservation }),
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