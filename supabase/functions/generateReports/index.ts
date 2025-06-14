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

    // Get all resources
    const { data: resources, error: resourcesError } = await supabaseClient
      .from('resources')
      .select('id, name, type')

    if (resourcesError) {
      throw new Error('Error fetching resources')
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Generate reports for each resource
    for (const resource of resources) {
      // Get all reservations for this resource in the current month
      const { data: reservations, error: reservationsError } = await supabaseClient
        .from('reservations')
        .select('*')
        .eq('resource_id', resource.id)
        .gte('starts_at', startOfMonth.toISOString())
        .lte('ends_at', endOfMonth.toISOString())

      if (reservationsError) {
        console.error(`Error fetching reservations for resource ${resource.id}:`, reservationsError)
        continue
      }

      // Calculate metrics
      const totalReservations = reservations.length
      const totalHours = reservations.reduce((acc, res) => {
        const duration = new Date(res.ends_at).getTime() - new Date(res.starts_at).getTime()
        return acc + duration / (1000 * 60 * 60) // Convert to hours
      }, 0)

      const monthDuration = (endOfMonth.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60)
      const utilizationRate = (totalHours / monthDuration) * 100

      // Update or insert report
      const { error: upsertError } = await supabaseClient
        .from('usage_reports')
        .upsert({
          resource_id: resource.id,
          resource_name: resource.name,
          total_reservations: totalReservations,
          total_hours: totalHours,
          utilization_rate: utilizationRate,
          period: startOfMonth.toISOString()
        })

      if (upsertError) {
        console.error(`Error upserting report for resource ${resource.id}:`, upsertError)
      }
    }

    return new Response(
      JSON.stringify({ message: 'Reports generated successfully' }),
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