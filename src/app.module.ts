import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentsModule } from './payments/payments.module';
import { DevicesModule } from './devices/devices.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminStatsController } from './admin-stats/admin-stats.controller';
import { AdminStatsService } from './admin-stats/admin-stats.service';
import { AdminStatsModule } from './admin-stats/admin-stats.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, CategoriesModule, ServicesModule, BookingsModule, ReviewsModule, PaymentsModule, DevicesModule, NotificationsModule, AdminStatsModule],
  controllers: [AppController, AdminStatsController],
  providers: [AppService, AdminStatsService],
})
export class AppModule {}
