import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

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
}