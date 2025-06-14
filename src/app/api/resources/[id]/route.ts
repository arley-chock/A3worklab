import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/resources/:id - Buscar um recurso por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const resource = await prisma.resource.findUnique({
      where: { id: id },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Recurso não encontrado' }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Erro ao buscar recurso:', error);
    return NextResponse.json({ error: 'Erro ao buscar recurso' }, { status: 500 });
  }
}

// PUT /api/resources/:id - Atualizar um recurso por ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updatedResource = await prisma.resource.update({
      where: { id: id },
      data: body,
    });
    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error('Erro ao atualizar recurso:', error);
    return NextResponse.json({ error: 'Erro ao atualizar recurso' }, { status: 500 });
  }
}

// DELETE /api/resources/:id - Excluir um recurso por ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.resource.delete({
      where: { id: id },
    });
    return NextResponse.json({ message: 'Recurso excluído com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir recurso:', error);
    return NextResponse.json({ error: 'Erro ao excluir recurso' }, { status: 500 });
  }
} 