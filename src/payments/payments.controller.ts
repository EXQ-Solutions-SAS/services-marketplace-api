import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @UseGuards(FirebaseAuthGuard)
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.processPayment(createPaymentDto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles('ADMIN') // Solo el admin ve la lista completa
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('status/:bookingId')
  @UseGuards(FirebaseAuthGuard)
  async getStatus(
    @Param('bookingId') bookingId: string,
    @GetUser('id') userId: string, // <--- Sacamos el ID del token
    @GetUser('role') role: string, // <--- Sacamos el Role del token
  ) {
    // Ahora sí le pasamos los 3 argumentos que el Service está pidiendo
    return this.paymentsService.getStatus(bookingId, userId, role);
  }
}
