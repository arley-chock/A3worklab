import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Rotas públicas que não precisam de autenticação, incluindo APIs de autenticação
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/auth/login',
  '/api/auth/register',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se é uma rota pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar se é uma rota da API
  if (pathname.startsWith('/api')) {
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    try {
      // Verificar o token JWT
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }
  }

  // Para rotas não-API, verificar se o usuário está autenticado
  const token = request.cookies.get('token')?.value

  if (!token) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  try {
    // Verificar o token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch (error) {
    // Token inválido, redirecionar para login
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 