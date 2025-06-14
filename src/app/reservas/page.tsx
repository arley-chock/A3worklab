'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const reservaSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  data: z.string(),
  horario: z.string(),
  recursos: z.array(z.string())
})

type ReservaFormData = z.infer<typeof reservaSchema>

export default function ReservasPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema)
  })

  const onSubmit = async (data: ReservaFormData) => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('reservas')
        .insert([{
          ...data,
          status: 'pendente',
          created_at: new Date().toISOString()
        }])

      if (error) throw error

      alert('Reserva realizada com sucesso!')
      reset()
    } catch (error) {
      console.error('Erro ao criar reserva:', error)
      alert('Erro ao criar reserva. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Nova Reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo</label>
                <Input
                  {...register('nome')}
                  placeholder="Digite seu nome completo"
                  className="w-full"
                />
                {errors.nome && (
                  <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <Input
                  {...register('telefone')}
                  placeholder="(00) 00000-0000"
                  className="w-full"
                />
                {errors.telefone && (
                  <p className="text-red-500 text-sm mt-1">{errors.telefone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data</label>
                  <Input
                    {...register('data')}
                    type="date"
                    className="w-full"
                  />
                  {errors.data && (
                    <p className="text-red-500 text-sm mt-1">{errors.data.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Horário</label>
                  <Input
                    {...register('horario')}
                    type="time"
                    className="w-full"
                  />
                  {errors.horario && (
                    <p className="text-red-500 text-sm mt-1">{errors.horario.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 'Criar Reserva'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 