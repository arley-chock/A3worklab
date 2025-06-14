'use client'

import { useState } from 'react'
import { CalendarTimeline } from './CalendarTimeline'
import { ModalReserve } from './ModalReserve'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

interface Resource {
  id: string
  type: 'room' | 'desk' | 'laptop' | 'projector'
  name: string
  description: string
  capacity: number
  location: string
  restrictions: Record<string, any>
}

interface ResourceCardProps {
  resource: Resource
}

const resourceTypeLabels = {
  room: 'Sala',
  desk: 'Mesa',
  laptop: 'Notebook',
  projector: 'Projetor',
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{resource.name}</CardTitle>
            <CardDescription>{resource.description}</CardDescription>
          </div>
          <Badge variant="secondary">
            {resourceTypeLabels[resource.type]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Localização:</span>{' '}
              {resource.location}
            </div>
            {resource.capacity && (
              <div>
                <span className="font-medium">Capacidade:</span>{' '}
                {resource.capacity} pessoas
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Disponibilidade</h3>
              <Button
                onClick={() => {
                  setSelectedDate(new Date())
                  setIsModalOpen(true)
                }}
              >
                Nova Reserva
              </Button>
            </div>
            <CalendarTimeline
              resourceId={resource.id}
              onReservationClick={(reservation) => {
                setSelectedDate(new Date(reservation.starts_at))
                setIsModalOpen(true)
              }}
            />
          </div>
        </div>

        <ModalReserve
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          resourceId={resource.id}
          initialDate={selectedDate}
        />
      </CardContent>
    </Card>
  )
} 