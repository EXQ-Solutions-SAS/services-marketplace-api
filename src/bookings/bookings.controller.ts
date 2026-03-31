import { Controller, Post, Get, Body, UseGuards, Patch, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller('bookings')
@UseGuards(FirebaseAuthGuard)
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Post()
    async create(
        @Body() createBookingDto: CreateBookingDto,
        @GetUser('id') userId: string,
    ) {
        return this.bookingsService.create(createBookingDto, userId);
    }

    @Get('my-bookings')
    async getMyBookings(@GetUser('id') userId: string) {
        return this.bookingsService.findByCustomer(userId);
    }

    @Get('provider-dashboard')
    async getProviderBookings(@GetUser('id') userId: string) {
        // Necesitaremos un método en el service que busque por provider.userId
        return this.bookingsService.findByProvider(userId);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateBookingStatusDto,
        @GetUser() user: any // Obtenemos el usuario completo para checkear el ID y el Role
    ) {
        return this.bookingsService.updateStatus(id, dto.status, user.id, user.role);
    }
}