import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ConfirmedReservation {
  startTime: Date | string;
  endTime: Date | string;
}

interface ResourceCount {
  resourceId: string;
  _count: {
    resourceId: number;
  };
}

export async function GET() {
  try {
    const totalReservations = await prisma.reservation.count();
    const confirmedReservations = await prisma.reservation.count({
      where: { status: 'confirmed' },
    });
    const pendingReservations = await prisma.reservation.count({
      where: { status: 'pending' },
    });
    const cancelledReservations = await prisma.reservation.count({
      where: { status: 'cancelled' },
    });

    const totalResources = await prisma.resource.count();
    const totalUsers = await prisma.user.count();

    // Calcular tempo médio de uso para reservas confirmadas
    const confirmedRes: ConfirmedReservation[] = await prisma.reservation.findMany({
      where: { status: 'confirmed' },
      select: { startTime: true, endTime: true },
    });

    let totalDurationMs = 0;
    confirmedRes.forEach((res: ConfirmedReservation) => {
      const start = new Date(res.startTime).getTime();
      const end = new Date(res.endTime).getTime();
      totalDurationMs += end - start;
    });

    const averageDurationMs = confirmedRes.length > 0 ? totalDurationMs / confirmedRes.length : 0;
    const averageDurationMinutes = Math.floor(averageDurationMs / (1000 * 60));
    const averageDurationHours = Math.floor(averageDurationMinutes / 60);
    const remainingMinutes = averageDurationMinutes % 60;
    const averageUsageTime = averageDurationMs > 0 ? `${averageDurationHours}h ${remainingMinutes}m` : '0h 0m';

    // Recursos mais utilizados
    const mostUsedResources = await prisma.reservation.groupBy({
      by: ['resourceId'],
      _count: {
        resourceId: true,
      },
      orderBy: {
        _count: {
          resourceId: 'desc',
        },
      },
      take: 1, // Pegar o recurso mais utilizado
    });

    let mostUsedResourceName = 'Nenhum';
    let mostUsedResourceCount = 0;

    if (mostUsedResources.length > 0) {
      const resourceId = mostUsedResources[0].resourceId;
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
        select: { name: true },
      });
      mostUsedResourceName = resource?.name || 'Desconhecido';
      mostUsedResourceCount = mostUsedResources[0]._count.resourceId;
    }

    // Taxa de Utilização por Recurso (simplificada: % de reservas em relação ao total de reservas)
    const resourceCounts = await prisma.reservation.groupBy({
      by: ['resourceId'],
      _count: {
        resourceId: true,
      },
    });

    const totalConfirmedReservations = confirmedReservations; // Usar o total de confirmadas para base

    const utilizationByResource = await Promise.all(resourceCounts.map(async (rc: ResourceCount) => {
      const resource = await prisma.resource.findUnique({
        where: { id: rc.resourceId },
        select: { name: true },
      });
      const percentage = totalConfirmedReservations > 0 ? Math.round((rc._count.resourceId / totalConfirmedReservations) * 100) : 0;
      return { name: resource?.name || 'Desconhecido', utilization: percentage };
    }));

    // Dados para os cards de estatísticas
    const stats = [
      {
        name: 'Taxa de Utilização (Confirmadas)',
        value: `${totalReservations > 0 ? Math.round((confirmedReservations / totalReservations) * 100) : 0}%`,
        icon: 'ChartBarIcon',
        change: `+${confirmedReservations} confirmadas`,
        changeType: 'positive',
      },
      {
        name: 'Tempo Médio de Uso (Confirmadas)',
        value: averageUsageTime,
        icon: 'ClockIcon',
        change: '+0m', // Simplificado, pode ser aprimorado
        changeType: 'positive',
      },
      {
        name: 'Total de Recursos',
        value: String(totalResources),
        icon: 'BuildingOfficeIcon',
        change: '+0', // Simplificado
        changeType: 'neutral',
      },
      {
        name: 'Total de Usuários',
        value: String(totalUsers),
        icon: 'UserGroupIcon',
        change: '+0',
        changeType: 'neutral',
      },
      {
        name: 'Reservas Pendentes',
        value: String(pendingReservations),
        icon: 'CalendarIcon',
        change: '+0', // Simplificado
        changeType: 'neutral',
      },
      {
        name: 'Reservas Canceladas',
        value: String(cancelledReservations),
        icon: 'ChartBarIcon',
        change: '+0',
        changeType: 'neutral',
      },
      {
        name: 'Recurso Mais Utilizado',
        value: mostUsedResourceName,
        icon: 'BuildingOfficeIcon',
        change: `${mostUsedResourceCount} reservas`,
        changeType: 'neutral',
      },
    ];

    return NextResponse.json({
      stats,
      resourceUtilization: utilizationByResource,
    });
  } catch (error) {
    console.error('Erro ao buscar dados de relatórios:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados de relatórios', details: (error as Error).message }, { status: 500 });
  }
} 