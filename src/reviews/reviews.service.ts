import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) { }

  async create(createReviewDto: CreateReviewDto, reviewerId: string) {
    const { bookingId, rating, comment } = createReviewDto;

    // 1. Obtener booking con sus participantes
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: { include: { provider: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('You can only review completed bookings');
    }

    // 2. Determinar quién recibe la calificación
    let revieweeId: string;
    const providerUserId = booking.service.provider.userId;

    if (booking.customerId === reviewerId) {
      revieweeId = providerUserId;
    } else if (providerUserId === reviewerId) {
      revieweeId = booking.customerId;
    } else {
      throw new BadRequestException('You are not a participant of this booking');
    }

    try {
      // 3. Crear la reseña
      // Al usar el bookingId, Prisma ya la asocia automáticamente al array reviews[] del Booking
      return await this.prisma.review.create({
        data: {
          rating,
          comment,
          bookingId,
          reviewerId,
          revieweeId,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('You have already reviewed this booking');
      }
      throw error;
    }
  }

  // 4. Traer reseñas + Promedio en una sola respuesta
  async findByUserWithStats(userId: string) {
    const [reviews, stats] = await Promise.all([
      this.prisma.review.findMany({
        where: { revieweeId: userId },
        include: {
          reviewer: {
            select: { id: true, name: true, email: true }
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.getAverageRating(userId)
    ]);

    return {
      stats,   // Aquí va { average, total }
      reviews  // Aquí la lista de reseñas
    };
  }

  async getAverageRating(userId: string) {
    const aggregate = await this.prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      average: Number((aggregate._avg.rating || 0).toFixed(1)), // Redondeado a 1 decimal
      total: aggregate._count.rating,
    };
  }
}