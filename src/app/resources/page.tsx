"use client"
import { useEffect, useState } from 'react'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Cookies from 'js-cookie';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export const dynamic = 'force-dynamic'

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([])
  // const [showForm, setShowForm] = useState(false)
  // const [editing, setEditing] = useState<any>(null)
  // const [form, setForm] = useState({
  //   name: '',
  //   type: '',
  //   location: '',
  //   capacity: '',
  //   restrictions: '',
  // })
  // const supabase = createClientComponentClient()

  useEffect(() => {
    fetchResources()
  }, [])

  async function fetchResources() {
    try {
      const token = Cookies.get('token');
      if (!token) {
        console.error('Token de autenticação não encontrado.');
        setResources([]); // Limpa os recursos se não houver token
        return;
      }

      const response = await fetch('/api/resources', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setResources(data || [])
    } catch (error) {
      console.error('Erro ao buscar recursos:', error)
    }
  }

  // function handleEdit(resource: any) {
  //   setEditing(resource)
  //   setForm({
  //     name: resource.name,
  //     type: resource.type,
  //     location: resource.location,
  //     capacity: resource.capacity,
  //     restrictions: resource.restrictions || '',
  //   })
  //   setShowForm(true)
  // }

  // function handleNew() {
  //   setEditing(null)
  //   setForm({
  //     name: '',
  //     type: '',
  //     location: '',
  //     capacity: '',
  //     restrictions: '',
  //   })
  //   setShowForm(true)
  // }

  async function handleDelete(id: string) {
    if (confirm('Deseja excluir este recurso?')) {
      try {
        const token = Cookies.get('token');
        if (!token) {
          alert('Token de autenticação não encontrado. Faça login novamente.');
          return;
        }

        const response = await fetch(`/api/resources/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        fetchResources()
      } catch (error) {
        console.error('Erro ao excluir recurso:', error)
        alert('Erro ao excluir recurso.')
      }
    }
  }

  // async function handleSubmit(e: React.FormEvent) {
  //   e.preventDefault()
  //   let restrictionsJson = {}
  //   try {
  //     restrictionsJson = form.restrictions ? JSON.parse(form.restrictions) : {}
  //   } catch {
  //     alert('Restrições devem ser um JSON válido!')
  //     return
  //   }
  //   if (editing) {
  //     await supabase
  //       .from("resources")
  //       .update({
  //         ...form,
  //         capacity: Number(form.capacity),
  //         restrictions: restrictionsJson,
  //       })
  //       .eq("id", editing.id)
  //   } else {
  //     await supabase.from("resources").insert({
  //       ...form,
  //       capacity: Number(form.capacity),
  //       restrictions: restrictionsJson,
  //     })
  //   }
  //   setShowForm(false)
  //   fetchResources()
  // }

  const resourceTypes = {
    SALA: 'Sala',
    EQUIPAMENTO: 'Equipamento',
    VEICULO: 'Veículo',
    OUTRO: 'Outro',
    // Adicione outros tipos conforme necessário
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Recursos
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os recursos disponíveis para reserva.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/resources/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="h-5 w-5 inline-block mr-1" />
            Adicionar Recurso
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
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Tipo
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Descrição
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Capacidade
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Localização
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {resources.map((resource) => (
                    <tr key={resource.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {resource.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {resourceTypes[resource.type as keyof typeof resourceTypes]}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {resource.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {resource.capacity || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {resource.location}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link
                          href={`/resources/${resource.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(resource.id)}
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
  )
} 