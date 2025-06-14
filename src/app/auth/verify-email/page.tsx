'use client'

import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verifique seu email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enviamos um link de confirmação para seu email. Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/auth/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
} 