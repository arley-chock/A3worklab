import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    // Verificar o token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar usuário' },
      { status: 500 }
    );
  }
} 