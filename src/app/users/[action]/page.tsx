"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function UserFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.action === 'edit';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      // Aqui você buscaria os dados do usuário para edição
      setFormData({
        name: 'João Silva',
        email: 'joao.silva@empresa.com',
        department: 'Desenvolvimento',
        role: 'user',
        phone: '(11) 99999-9999',
        password: '',
        confirmPassword: '',
      });
    }
  }, [isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isEdit && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      // Aqui você implementaria a lógica de criação/edição do usuário
      setSuccess(
        isEdit
          ? 'Usuário atualizado com sucesso!'
          : 'Usuário criado com sucesso!'
      );
      setTimeout(() => {
        router.push('/users');
      }, 2000);
    } catch (err) {
      setError(
        isEdit
          ? 'Erro ao atualizar usuário. Tente novamente.'
          : 'Erro ao criar usuário. Tente novamente.'
      );
    }
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
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
                      Nome completo
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
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Departamento
                    </label>
                    <select
                      id="department"
                      name="department"
                      required
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Selecione um departamento</option>
                      <option value="Desenvolvimento">Desenvolvimento</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Vendas">Vendas</option>
                      <option value="RH">RH</option>
                      <option value="Financeiro">Financeiro</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Função
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Selecione uma função</option>
                      <option value="admin">Administrador</option>
                      <option value="manager">Gerente</option>
                      <option value="user">Usuário</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  {!isEdit && (
                    <>
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Senha
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          required
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Confirmar senha
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          required
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/users')}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {isEdit ? 'Salvar alterações' : 'Criar usuário'}
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