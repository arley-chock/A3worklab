import { Twilio } from 'https://esm.sh/twilio@4.19.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const twilioClient = new Twilio(
  Deno.env.get('TWILIO_ACCOUNT_SID') ?? '',
  Deno.env.get('TWILIO_AUTH_TOKEN') ?? ''
)

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

export async function sendConfirmation(reservationId: string) {
  try {
    // Get reservation details
    const { data: reservation, error: reservationError } = await supabaseClient
      .from('reservations')
      .select(`
        *,
        resources (
          name,
          type
        ),
        users (
          phone
        )
      `)
      .eq('id', reservationId)
      .single()

    if (reservationError || !reservation) {
      throw new Error('Reservation not found')
    }

    if (!reservation.users?.phone) {
      console.warn('User has no phone number registered')
      return
    }

    // Format message
    const startsAt = new Date(reservation.starts_at)
    const message = `Sua reserva foi confirmada:\n\n` +
      `Recurso: ${reservation.resources.name} (${reservation.resources.type})\n` +
      `Data: ${startsAt.toLocaleDateString()}\n` +
      `Horário: ${startsAt.toLocaleTimeString()}\n` +
      `Duração: ${Math.round((new Date(reservation.ends_at).getTime() - startsAt.getTime()) / (1000 * 60))} minutos`

    // Send message via Twilio
    await twilioClient.messages.create({
      body: message,
      to: reservation.users.phone,
      from: Deno.env.get('TWILIO_PHONE_NUMBER')
    })
  } catch (error) {
    console.error('Error sending confirmation:', error)
    throw error
  }
}

export async function sendReminder(reservationId: string) {
  try {
    // Get reservation details
    const { data: reservation, error: reservationError } = await supabaseClient
      .from('reservations')
      .select(`
        *,
        resources (
          name,
          type
        ),
        users (
          phone
        )
      `)
      .eq('id', reservationId)
      .single()

    if (reservationError || !reservation) {
      throw new Error('Reservation not found')
    }

    if (!reservation.users?.phone) {
      console.warn('User has no phone number registered')
      return
    }

    // Format message
    const startsAt = new Date(reservation.starts_at)
    const message = `Lembrete de reserva:\n\n` +
      `Recurso: ${reservation.resources.name} (${reservation.resources.type})\n` +
      `Data: ${startsAt.toLocaleDateString()}\n` +
      `Horário: ${startsAt.toLocaleTimeString()}\n` +
      `Duração: ${Math.round((new Date(reservation.ends_at).getTime() - startsAt.getTime()) / (1000 * 60))} minutos`

    // Send message via Twilio
    await twilioClient.messages.create({
      body: message,
      to: reservation.users.phone,
      from: Deno.env.get('TWILIO_PHONE_NUMBER')
    })
  } catch (error) {
    console.error('Error sending reminder:', error)
    throw error
  }
}

export async function sendOTP(phone: string) {
  try {
    const verification = await twilioClient.verify.v2
      .services(Deno.env.get('TWILIO_VERIFY_SID') ?? '')
      .verifications.create({ to: phone, channel: 'whatsapp' })

    return verification
  } catch (error) {
    console.error('Error sending OTP:', error)
    throw error
  }
}

export async function verifyOTP(phone: string, code: string) {
  try {
    const verification = await twilioClient.verify.v2
      .services(Deno.env.get('TWILIO_VERIFY_SID') ?? '')
      .verificationChecks.create({ to: phone, code })

    return verification
  } catch (error) {
    console.error('Error verifying OTP:', error)
    throw error
  }
} 