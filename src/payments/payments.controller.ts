import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @UseGuards(FirebaseAuthGuard)
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.processPayment(createPaymentDto);
  }

  @Get('status/:bookingId')
  @UseGuards(FirebaseAuthGuard)
  async getStatus(
    @Param('bookingId') bookingId: string,
    @GetUser('id') userId: string,    // <--- Sacamos el ID del token
    @GetUser('role') role: string    // <--- Sacamos el Role del token
  ) {
    // Ahora sí le pasamos los 3 argumentos que el Service está pidiendo
    return this.paymentsService.getStatus(bookingId, userId, role);
  }
}