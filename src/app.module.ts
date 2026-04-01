import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, CategoriesModule, ServicesModule, BookingsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
