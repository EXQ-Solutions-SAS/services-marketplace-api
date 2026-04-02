import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BookingStatus, TransactionStatus } from '@prisma/client';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService, private notificationsService: NotificationsService) { }

    async processPayment(createPaymentDto: CreatePaymentDto) {
        const { bookingId, amount, paymentMethod } = createPaymentDto;

        // 1. Verificar que la reserva existe
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) throw new NotFoundException('Booking not found');

        // 2. Crear la transacción en estado PENDING
        const transaction = await this.prisma.transaction.create({
            data: {
                bookingId,
                amount,
                paymentMethod,
                status: 'PENDING',
            },
        });

        // 3. SIMULACIÓN DE PASARELA (Mock)
        // Esperamos 2 segundos y devolvemos "éxito"
        return new Promise((resolve) => {
            setTimeout(async () => {
                const updated = await this.prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'COMPLETED' as TransactionStatus,
                        externalReference: `MOCK_REF_${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
                    },
                });
                resolve({
                    message: 'Payment processed successfully',
                    transaction: updated,
                });
            }, 2000);
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