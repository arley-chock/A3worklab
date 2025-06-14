import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reservations - Listar todas as reservas
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        resource: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    return NextResponse.json({ error: 'Erro ao buscar reservas' }, { status: 500 });
  }
}

// POST /api/reservations - Criar uma nova reserva
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resourceId, userId, startTime, endTime, description, status } = body;

    const newReservation = await prisma.reservation.create({
      data: {
        resourceId,
        userId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        description,
        status,
      },
    });
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    return NextResponse.json({ error: 'Erro ao criar reserva' }, { status: 500 });
  }
} 