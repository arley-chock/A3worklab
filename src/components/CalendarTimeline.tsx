'use client'

import { useEffect, useState } from 'react'
import { format, addHours, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Reservation {
  id: string
  starts_at: string
  ends_at: string
  user_id: string
  status: 'active' | 'cancelled' | 'completed'
}

interface CalendarTimelineProps {
  resourceId: string
  onReservationClick?: (reservation: Reservation) => void
}

export function CalendarTimeline({ resourceId, onReservationClick }: CalendarTimelineProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const supabase = createClientComponentClient()

  useEffect(() => {
    const channel = supabase
      .channel(`resource-${resourceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `resource_id=eq.${resourceId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReservations((prev) => [...prev, payload.new as Reservation])
          } else if (payload.eventType === 'UPDATE') {
            setReservations((prev) =>
              prev.map((r) => (r.id === payload.new.id ? (payload.new as Reservation) : r))
            )
          } else if (payload.eventType === 'DELETE') {
            setReservations((prev) => prev.filter((r) => r.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel as RealtimeChannel)
    }
  }, [resourceId, supabase])

  useEffect(() => {
    const fetchReservations = async () => {
      const { data } = await supabase
        .from('reservations')
        .select('*')
        .eq('resource_id', resourceId)
        .gte('starts_at', startOfDay(selectedDate).toISOString())
        .lte('ends_at', endOfDay(selectedDate).toISOString())

      if (data) {
        setReservations(data as Reservation[])
      }
    }

    fetchReservations()
  }, [resourceId, selectedDate, supabase])

  const hours = Array.from({ length: 24 }, (_, i) => addHours(startOfDay(selectedDate), i))

  return (
    <div className="w-full h-[600px] overflow-y-auto border rounded-lg">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4">
        <h2 className="text-lg font-semibold">
          {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
      </div>
      <div className="relative">
        {hours.map((hour) => (
          <div
            key={hour.toISOString()}
            className="h-16 border-b flex items-center px-4"
          >
            <span className="text-sm text-gray-500 w-16">
              {format(hour, 'HH:mm')}
            </span>
            <div className="flex-1 relative h-full">
              {reservations
                .filter(
                  (r) =>
                    new Date(r.starts_at) <= hour &&
                    new Date(r.ends_at) > hour
                )
                .map((reservation) => (
                  <div
                    key={reservation.id}
                    className="absolute inset-y-0 left-0 right-0 bg-blue-100 dark:bg-blue-900 rounded p-2 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                    style={{
                      top: `${(new Date(reservation.starts_at).getMinutes() / 60) * 100}%`,
                      height: `${
                        ((new Date(reservation.ends_at).getTime() -
                          new Date(reservation.starts_at).getTime()) /
                          (1000 * 60 * 60)) *
                        100
                      }%`,
                    }}
                    onClick={() => onReservationClick?.(reservation)}
                  >
                    <div className="text-xs truncate">
                      {format(new Date(reservation.starts_at), 'HH:mm')} -{' '}
                      {format(new Date(reservation.ends_at), 'HH:mm')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 