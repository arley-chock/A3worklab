'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface ModalReserveProps {
  isOpen: boolean
  onClose: () => void
  resourceId: string
  initialDate?: Date
  reservation?: {
    id: string
    starts_at: string
    ends_at: string
  }
}

export function ModalReserve({
  isOpen,
  onClose,
  resourceId,
  initialDate,
  reservation,
}: ModalReserveProps) {
  const [startsAt, setStartsAt] = useState(
    initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : ''
  )
  const [endsAt, setEndsAt] = useState(
    initialDate ? format(new Date(initialDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm") : ''
  )
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Não autorizado')

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/createReservation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            resource_id: resourceId,
            starts_at: new Date(startsAt).toISOString(),
            ends_at: new Date(endsAt).toISOString(),
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar reserva')
      }

      toast({
        title: 'Reserva criada com sucesso!',
        description: 'Você receberá uma confirmação por WhatsApp.',
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Erro ao criar reserva',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {reservation ? 'Editar Reserva' : 'Nova Reserva'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="starts_at">Início</Label>
            <Input
              id="starts_at"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ends_at">Fim</Label>
            <Input
              id="ends_at"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 