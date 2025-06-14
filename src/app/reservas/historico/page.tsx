'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Reserva = {
  id: string
  nome: string
  email: string
  telefone: string
  data: string
  horario: string
  status: string
  created_at: string
}

export default function HistoricoReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const { data, error } = await supabase
          .from('reservas')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setReservas(data || [])
      } catch (error) {
        console.error('Erro ao buscar reservas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservas()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmada':
        return 'bg-green-100 text-green-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Histórico de Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : reservas.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhuma reserva encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Telefone</th>
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Horário</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((reserva) => (
                    <tr key={reserva.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{reserva.nome}</td>
                      <td className="py-3 px-4">{reserva.email}</td>
                      <td className="py-3 px-4">{reserva.telefone}</td>
                      <td className="py-3 px-4">
                        {format(new Date(reserva.data), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="py-3 px-4">{reserva.horario}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(reserva.status)}`}>
                          {reserva.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 