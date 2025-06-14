'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import {
  UsersIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Total de Usuários',
    value: '24',
    icon: UsersIcon,
    change: '+4',
    changeType: 'positive',
  },
  {
    name: 'Recursos Disponíveis',
    value: '12',
    icon: ClipboardDocumentListIcon,
    change: '+2',
    changeType: 'positive',
  },
  {
    name: 'Reservas Hoje',
    value: '8',
    icon: CalendarIcon,
    change: '-2',
    changeType: 'negative',
  },
  {
    name: 'Tempo Médio de Uso',
    value: '2h 30m',
    icon: ClockIcon,
    change: '+15m',
    changeType: 'positive',
  },
];

const upcomingReservations = [
  {
    id: 1,
    resource: 'Sala de Reunião A',
    user: 'João Silva',
    startTime: '14:00',
    endTime: '15:30',
    date: '2024-03-20',
  },
  {
    id: 2,
    resource: 'Projetor 1',
    user: 'Maria Santos',
    startTime: '15:00',
    endTime: '16:00',
    date: '2024-03-20',
  },
  {
    id: 3,
    resource: 'Estação de Trabalho 3',
    user: 'Pedro Oliveira',
    startTime: '16:30',
    endTime: '18:00',
    date: '2024-03-20',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-indigo-500 p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Próximas Reservas
          </h3>
          <div className="mt-6 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {upcomingReservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {reservation.resource}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {reservation.user}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(reservation.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {reservation.startTime} - {reservation.endTime}
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
    </div>
  );
} 