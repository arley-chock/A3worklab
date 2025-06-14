"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';

export default function ResourceFormPage() {
  const router = useRouter();
  const params = useParams();
  const action = params.action as string;
  const isEdit = action !== 'new';
  const resourceId = isEdit ? action : null;

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    capacity: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && resourceId) {
      const fetchResource = async () => {
        setLoading(true);
        try {
          const token = Cookies.get('token');
          const response = await fetch(`/api/resources/${resourceId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Erro ao buscar recurso para edição');
          }
          const data = await response.json();
          setFormData({
            name: data.name || '',
            type: data.type || '',
            description: data.description || '',
            capacity: data.capacity !== undefined ? String(data.capacity) : '',
            location: data.location || '',
          });
        } catch (err: any) {
          setError(err.message || 'Erro ao carregar recurso.');
        } finally {
          setLoading(false);
        }
      };
      fetchResource();
    }
  }, [isEdit, resourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Token de autenticação não encontrado. Faça login novamente.');
        setLoading(false);
        router.push('/auth/login');
        return;
      }

      const url = isEdit ? `/api/resources/${resourceId}` : '/api/resources';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          capacity: Number(formData.capacity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar recurso.');
      }

      setSuccess(
        isEdit
          ? 'Recurso atualizado com sucesso!'
          : 'Recurso criado com sucesso!'
      );
      setTimeout(() => {
        router.push('/resources');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Definir os tipos de recurso para o select, alinhado com o Prisma schema
  const resourceOptionTypes = [
    { value: 'SALA', label: 'Sala' },
    { value: 'EQUIPAMENTO', label: 'Equipamento' },
    { value: 'VEICULO', label: 'Veículo' },
    { value: 'OUTRO', label: 'Outro' },
  ];

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? 'Editar Recurso' : 'Novo Recurso'}
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nome
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tipo
                    </label>
                    <select
                      id="type"
                      name="type"
                      required
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Selecione um tipo</option>
                      {resourceOptionTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="capacity"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Capacidade
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      id="capacity"
                      required
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Localização
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      required
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/resources')}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Recurso'}
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