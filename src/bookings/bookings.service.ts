import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
    constructor(private prisma: PrismaService) { }

    async create(createBookingDto: CreateBookingDto, customerId: string) {
        const { serviceId, scheduledAt, hours } = createBookingDto;

        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                provider: true // Esto nos trae el objeto Provider completo
            }
        });

        if (!service) throw new NotFoundException('Service not found');

        if (!service.provider) {
            throw new BadRequestException('This service does not have a valid provider record');
        }

        if (service.provider.userId === customerId) {
            throw new BadRequestException('You cannot book your own service');
        }

        const totalPrice = service.pricePerHour * hours;

        // 4. CREACIÓN: Usamos explícitamente el ID de la tabla PROVIDER
        return this.prisma.booking.create({
            data: {
                customer: { connect: { id: customerId } },
                provider: { connect: { id: service.provider.id } }, // <--- USAMOS EL ID DEL OBJETO PROVIDER
                service: { connect: { id: service.id } },
                hours,
                totalPrice,
                scheduledAt: new Date(scheduledAt),
                status: 'PENDING',
            },
        });
    }

    async updateStatus(id: string, status: BookingStatus, userId: string, role: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: { provider: true } // Para saber quién es el dueño del servicio
        });

        if (!booking) throw new NotFoundException('Booking not found');

        // REGLA 1: Solo el PROVIDER de este servicio puede marcarla como ACCEPTED o COMPLETED
        if ((status === 'ACCEPTED' || status === 'COMPLETED') && booking.provider.userId !== userId) {
            throw new BadRequestException('Only the assigned provider can accept or complete this booking');
        }

        // REGLA 2: Ambos pueden CANCELLED, pero solo si son parte de la reserva
        if (status === 'CANCELLED') {
            const isCustomer = booking.customerId === userId;
            const isProvider = booking.provider.userId === userId;
            if (!isCustomer && !isProvider && role !== 'ADMIN') {
                throw new BadRequestException('You are not authorized to cancel this booking');
            }
        }

        // REGLA 3: No se puede cambiar nada si ya está COMPLETED o CANCELLED (estados finales)
        if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
            throw new BadRequestException(`Cannot change status of a ${booking.status} booking`);
        }

        return this.prisma.booking.update({
            where: { id },
            data: { status }
        });
    }

    async findByProvider(userId: string) {
        return this.prisma.booking.findMany({
            where: { provider: { userId: userId } },
            include: { service: true, customer: true },
            orderBy: { scheduledAt: 'asc' }
        });
    }

    // Para que el cliente vea sus reservas
    async findByCustomer(customerId: string) {
        return this.prisma.booking.findMany({
            where: { customerId },
            include: { service: true, provider: true },
            orderBy: { createdAt: 'desc' }
        });
    }
}