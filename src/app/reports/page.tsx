"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import Cookies from 'js-cookie';

interface Stat {
  name: string;
  value: string;
  icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

interface ResourceUtilization {
  name: string;
  utilization: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [resourceUtilization, setResourceUtilization] = useState<ResourceUtilization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = Cookies.get('token');
        console.log('Token recuperado do Cookies:', token);
        const response = await fetch('/api/reports', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Dados recebidos da API de relatórios:', data);

        // Mapear os ícones de volta para os componentes React
        const mappedStats: Stat[] = data.stats.map((stat: any) => {
          let IconComponent;
          switch (stat.icon) {
            case 'ChartBarIcon':
              IconComponent = ChartBarIcon;
              break;
            case 'ClockIcon':
              IconComponent = ClockIcon;
              break;
            case 'BuildingOfficeIcon':
              IconComponent = BuildingOfficeIcon;
              break;
            case 'CalendarIcon':
              IconComponent = CalendarIcon;
              break;
            default:
              IconComponent = ChartBarIcon; // Fallback
          }
          return {
            ...stat,
            icon: IconComponent,
          };
        });

        setStats(mappedStats);
        setResourceUtilization(data.resourceUtilization);
      } catch (err) {
        console.error("Erro ao buscar relatórios:", err);
        setError("Não foi possível carregar os relatórios. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-700">Carregando relatórios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Relatórios
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Estatísticas e métricas de utilização dos recursos.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                    : stat.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Taxa de Utilização por Recurso
            </h3>
            <div className="mt-6">
              <div className="flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden">
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
                              Taxa de Utilização
                            </th>
                            <th
                              scope="col"
                              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                              Barra de Progresso
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {resourceUtilization.map((resource) => (
                            <tr key={resource.name}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                {resource.name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {resource.utilization}%
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-indigo-600 h-2.5 rounded-full"
                                    style={{ width: `${resource.utilization}%` }}
                                  ></div>
                                </div>
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
        </div>
      </div>
    </div>
  );
} 