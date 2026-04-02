import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetUser } from '../auth/decorators/get-user.decorator'; // Ajusta la ruta
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(
    @Body() createReviewDto: CreateReviewDto,
    @GetUser('id') userId: string,
  ) {
    return this.reviewsService.create(createReviewDto, userId);
  }

  // Obtener todas las reseñas que ha recibido un usuario específico (público)
  @Get('user/:userId')
  async getReviewsByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(userId);
  }
}