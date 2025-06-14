import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/resources - Listar todos os recursos
export async function GET() {
  try {
    const resources = await prisma.resource.findMany();
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Erro ao buscar recursos:', error);
    return NextResponse.json({ error: 'Erro ao buscar recursos' }, { status: 500 });
  }
}

// POST /api/resources - Criar um novo recurso
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newResource = await prisma.resource.create({ data: body });
    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar recurso:', error);
    return NextResponse.json({ error: 'Erro ao criar recurso' }, { status: 500 });
  }
} 