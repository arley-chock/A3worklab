import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reservations/:id - Buscar uma reserva por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const reservation = await prisma.reservation.findUnique({
      where: { id: id },
      include: {
        resource: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    return NextResponse.json({ error: 'Erro ao buscar reserva' }, { status: 500 });
  }
}

// PUT /api/reservations/:id - Atualizar uma reserva por ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { resourceId, userId, startTime, endTime, description, status } = body;

    const updatedReservation = await prisma.reservation.update({
      where: { id: id },
      data: {
        resourceId,
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description,
        status,
      },
    });
    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    return NextResponse.json({ error: 'Erro ao atualizar reserva' }, { status: 500 });
  }
}

// DELETE /api/reservations/:id - Excluir uma reserva por ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.reservation.delete({
      where: { id: id },
    });
    return NextResponse.json({ message: 'Reserva excluída com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir reserva:', error);
    return NextResponse.json({ error: 'Erro ao excluir reserva' }, { status: 500 });
  }
} 