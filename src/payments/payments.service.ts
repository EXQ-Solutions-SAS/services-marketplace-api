import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BookingStatus } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService, private notificationsService: NotificationsService) { }

    async processPayment(createPaymentDto: CreatePaymentDto) {
        const { bookingId, amount, paymentMethod } = createPaymentDto;

        // 1. Validaciones previas
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { transaction: true } // Vemos si ya tiene transacción
        });

        if (!booking) throw new NotFoundException('Reserva no encontrada');

        if (booking.transaction?.status === 'COMPLETED') {
            throw new BadRequestException('Esta reserva ya fue pagada exitosamente.');
        }

        // 2. Transacción de base de datos (Garantiza que el pago y el estado cambien juntos)
        // Usamos una transacción de Prisma ($transaction) para que si algo falla, nada se guarde
        return await this.prisma.$transaction(async (tx) => {

            // A. Crear o actualizar la transacción (usamos upsert por si ya existía una fallida)
            const transaction = await tx.transaction.upsert({
                where: { bookingId },
                update: {
                    amount,
                    paymentMethod,
                    status: 'PENDING',
                },
                create: {
                    bookingId,
                    amount,
                    paymentMethod,
                    status: 'PENDING',
                },
            });

            // B. Simular el delay de la pasarela (Mock)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // C. Actualizar Transacción a COMPLETED
            const completedTx = await tx.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'COMPLETED',
                    externalReference: `MOCK_REF_${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
                }
            });

            // D. ACTUALIZAR EL ESTADO DE LA RESERVA A PAID
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'PAID' } // Ahora sí coincide con el Enum corregido
            });

            return {
                message: 'Payment processed successfully',
                transaction: completedTx
            };
        });
    }

    async findAll() {
        return this.prisma.transaction.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                booking: true,
            }
        });
    }

    async getStatus(bookingId: string, userId: string, role: string) {
        const tx = await this.prisma.transaction.findUnique({
            where: { bookingId },
            include: {
                booking: {
                    select: {
                        customerId: true,
                        service: { include: { provider: true } }
                    }
                }
            }
        });

        if (!tx) throw new NotFoundException('No transaction found');

        // VALIDACIÓN: ¿Es el cliente, el proveedor o un admin?
        const isCustomer = tx.booking.customerId === userId;
        const isProvider = tx.booking.service.provider.userId === userId;

        if (!isCustomer && !isProvider && role !== 'ADMIN') {
            throw new ForbiddenException('You are not authorized to see this transaction');
        }

        return tx;
    }

    async handleWebhook(payload: any) {
        // 1. EXTRAER EL ID (Esto depende de tu pasarela, ej: Stripe o PayPal)
        // Por ahora lo sacamos del payload que envíes en el body
        const { bookingId } = payload;

        if (!bookingId) {
            throw new BadRequestException('Booking ID is required in webhook payload');
        }

        // 2. ACTUALIZAR LA RESERVA
        // Usamos el include para que TS reconozca "booking.service.provider"
        const booking = await this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                // Usamos el valor del Enum de Prisma para evitar errores de tipo
                status: 'PAID' as BookingStatus
            },
            include: {
                customer: true,
                service: {
                    include: {
                        provider: true
                    }
                }
            }
        });

        // 3. NOTIFICACIÓN AL CLIENTE
        await this.notificationsService.notifyUser(
            booking.customerId,
            'Pago Confirmado ✅',
            'Tu pago ha sido procesado con éxito. ¡Prepárate para el servicio!',
            { bookingId: booking.id, type: 'PAYMENT_CONFIRMED' }
        );

        // 4. NOTIFICACIÓN AL PROVEEDOR
        await this.notificationsService.notifyUser(
            booking.service.provider.userId,
            'Servicio Pagado 💰',
            `El cliente ${booking.customer.name || ''} ha pagado. Ya puedes coordinar la ejecución.`,
            { bookingId: booking.id, type: 'PAYMENT_RECEIVED' }
        );

        return { received: true };
    }
}