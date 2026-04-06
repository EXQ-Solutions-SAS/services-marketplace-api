import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta la ruta

@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Ejecutamos varias promesas en paralelo para mayor velocidad
    const [
      totalRevenue,
      lastMonthRevenue,
      totalUsers,
      totalBookings,
      pendingBookings,
      categoryStats
    ] = await Promise.all([
      // 1. Revenue Total (Completed)
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' },
      }),
      // 2. Revenue Mes Pasado (Para calcular tendencia %)
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: lastMonth }
        },
      }),
      // 3. Conteo de Usuarios
      this.prisma.user.count({ where: { deletedAt: null } }),
      // 4. Conteo de Bookings y Efectividad
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      // 5. Data para la gráfica de Categorías (Top vendidas)
      this.prisma.category.findMany({
        where: { deletedAt: null },
        include: {
          _count: { select: { services: true } },
          services: {
            include: {
              _count: { select: { bookings: true } }
            }
          }
        }
      })
    ]);

    return {
      cards: {
        revenue: totalRevenue._sum.amount || 0,
        revenueGrowth: 12.5, // Aquí podrías calcular la diferencia real vs mes pasado
        users: totalUsers,
        bookings: totalBookings,
        pendingRate: (pendingBookings / totalBookings) * 100
      },
      charts: {
        categories: categoryStats.map(c => ({
          name: c.name,
          value: c.services.reduce((acc, s) => acc + s._count.bookings, 0)
        }))
      }
    };
  }

  // Query para la gráfica de línea (Ventas por mes)
  async getRevenueHistory() {
    // Nota: Para gráficas de tiempo, a veces es mejor usar Raw Query en Prisma 
    // para agrupar por mes directamente en PostgreSQL
    return this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as date, 
        SUM(amount) as total
      FROM transactions
      WHERE status = 'COMPLETED'
      GROUP BY date
      ORDER BY date ASC
      LIMIT 12
    `;
  }
}