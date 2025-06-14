"use client"

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

// const reservations = [
//   {
//     id: 1,
//     resource: 'Sala de Reunião A',
//     user: 'João Silva',
//     startTime: '2024-03-20T14:00:00',
//     endTime: '2024-03-20T15:30:00',
//     status: 'confirmed',
//   },
//   {
//     id: 2,
//     resource: 'Projetor 1',
//     user: 'Maria Santos',
//     startTime: '2024-03-20T15:00:00',
//     endTime: '2024-03-20T16:00:00',
//     status: 'pending',
//   },
//   {
//     id: 3,
//     resource: 'Estação de Trabalho 3',
//     user: 'Pedro Oliveira',
//     startTime: '2024-03-20T16:30:00',
//     endTime: '2024-03-20T18:00:00',
//     status: 'cancelled',
//   },
// ];

const statusStyles: { [key: string]: string } = {
  confirmed: 'bg-green-50 text-green-700 ring-green-600/20',
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
};

const statusLabels: { [key: string]: string } = {
  confirmed: 'Confirmada',
  pending: 'Pendente',
  cancelled: 'Cancelada',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([])

  useEffect(() => {
    fetchReservations()
  }, [])

  async function fetchReservations() {
    try {
      const token = Cookies.get('token')
      if (!token) {
        console.error('Token de autenticação não encontrado.')
        setReservations([])
        return
      }

      const response = await fetch('/api/reservations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setReservations(data || [])
    } catch (error) {
      console.error('Erro ao buscar reservas:', error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Deseja excluir esta reserva?')) {
      try {
        const token = Cookies.get('token')
        if (!token) {
          alert('Token de autenticação não encontrado. Faça login novamente.')
          return
        }

        const response = await fetch(`/api/reservations/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        fetchReservations()
      } catch (error) {
        console.error('Erro ao excluir reserva:', error)
        alert('Erro ao excluir reserva.')
      }
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Reservas
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todas as reservas de recursos.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/reservations/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            Nova Reserva
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Recurso
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Usuário
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Data
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Horário
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {reservation.resource.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {reservation.user.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(reservation.startTime).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(reservation.startTime).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {new Date(reservation.endTime).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            statusStyles[reservation.status]
                          }`}
                        >
                          {statusLabels[reservation.status]}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/reservations/${reservation.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(reservation.id)}
                          className="text-red-600 hover:text-red-900 ml-4"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 