import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, reviewerId: string) {
    const { bookingId, rating, comment } = createReviewDto;

    // 1. Obtener la reserva con los datos del Service -> Provider -> User
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId  },
      include: {
        service: {
          include: {
            provider: true,
          },
        },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    // 2. Solo se califica lo que ya se terminó
    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('You can only review completed bookings');
    }

    // 3. Lógica para determinar el Reviewee (quién recibe la nota)
    let revieweeId: string;

    const providerUserId = booking.service.provider.userId;

    if (booking.customerId === reviewerId) {
      // El que califica es el cliente, el que recibe es el proveedor
      revieweeId = providerUserId;
    } else if (providerUserId === reviewerId) {
      // El que califica es el proveedor, el que recibe es el cliente
      revieweeId = booking.customerId;
    } else {
      // Alguien que no pertenece a la reserva intenta meterse
      throw new BadRequestException('You are not a participant of this booking');
    }

    // 4. Crear la reseña (el @@unique en Prisma evitará duplicados)
    try {
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

  // Para mostrar en el perfil del usuario/proveedor
  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}