import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/users - Listar todos os usuários
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao listar usuários' },
      { status: 500 }
    );
  }
}

// POST /api/users - Criar um novo usuário
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, department, role, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department,
        role: role || 'user',
        phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
} 