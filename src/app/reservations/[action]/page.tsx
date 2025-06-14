"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuthContext } from '@/contexts/AuthContext'; // Importar o contexto de autenticação

export default function ReservationFormPage() {
  const router = useRouter();
  const params = useParams();
  const action = params.action as string;
  const isEdit = action !== 'new';
  const reservationId = isEdit ? action : null;

  const { user } = useAuthContext(); // Obter o usuário logado

  const [formData, setFormData] = useState({
    resourceId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: '',
    status: 'pending', // Status inicial para nova reserva
  });
  const [resources, setResources] = useState<any[]>([]); // Estado para armazenar recursos
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Buscar recursos disponíveis
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          console.error('Token não encontrado para buscar recursos.');
          return;
        }
        const response = await fetch('/api/resources', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Erro ao buscar recursos');
        }
        const data = await response.json();
        setResources(data);
      } catch (err) {
        console.error('Falha ao carregar recursos:', err);
        setError('Erro ao carregar recursos disponíveis.');
      }
    };
    fetchResources();
  }, []);

  // Buscar dados da reserva para edição
  useEffect(() => {
    if (isEdit && reservationId) {
      const fetchReservation = async () => {
        setLoading(true);
        try {
          const token = Cookies.get('token');
          if (!token) {
            setError('Token de autenticação não encontrado. Faça login novamente.');
            router.push('/auth/login');
            return;
          }
          const response = await fetch(`/api/reservations/${reservationId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Erro ao buscar reserva para edição');
          }
          const data = await response.json();

          setFormData({
            resourceId: data.resourceId || '',
            startDate: new Date(data.startTime).toISOString().split('T')[0] || '',
            startTime: new Date(data.startTime).toTimeString().slice(0, 5) || '',
            endDate: new Date(data.endTime).toISOString().split('T')[0] || '',
            endTime: new Date(data.endTime).toTimeString().slice(0, 5) || '',
            description: data.description || '',
            status: data.status || 'pending',
          });
        } catch (err: any) {
          setError(err.message || 'Erro ao carregar reserva.');
        } finally {
          setLoading(false);
        }
      };
      fetchReservation();
    }
  }, [isEdit, reservationId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!user) {
      setError('Usuário não autenticado.');
      setLoading(false);
      router.push('/auth/login');
      return;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      setError('A data/hora de término deve ser posterior à data/hora de início.');
      setLoading(false);
      return;
    }

    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Token de autenticação não encontrado. Faça login novamente.');
        setLoading(false);
        router.push('/auth/login');
        return;
      }

      const url = isEdit ? `/api/reservations/${reservationId}` : '/api/reservations';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        resourceId: formData.resourceId,
        userId: user.id, // ID do usuário logado
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        description: formData.description,
        status: formData.status,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar reserva.');
      }

      setSuccess(
        isEdit
          ? 'Reserva atualizada com sucesso!'
          : 'Reserva criada com sucesso!'
      );
      setTimeout(() => {
        router.push('/reservations');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const reservationStatuses = [
    { value: 'pending', label: 'Pendente' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'cancelled', label: 'Cancelada' },
  ];

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? 'Editar Reserva' : 'Nova Reserva'}
        </h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        {success}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              {loading && !error && !success && (
                <div className="rounded-md bg-blue-50 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Carregando...</h3>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="resourceId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Recurso
                    </label>
                    <select
                      id="resourceId"
                      name="resourceId"
                      required
                      value={formData.resourceId}
                      onChange={(e) =>
                        setFormData({ ...formData, resourceId: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Selecione um recurso</option>
                      {resources.map((resource) => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isEdit && (
                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        required
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value as 'pending' | 'confirmed' | 'cancelled' })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        {reservationStatuses.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Data de início
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="startTime"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Hora de início
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      id="startTime"
                      required
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Data de término
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endTime"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Hora de término
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      id="endTime"
                      required
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/reservations')}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Reserva'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 