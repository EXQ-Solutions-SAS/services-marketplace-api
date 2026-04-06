import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';

@Module({
    imports: [PrismaModule, UsersModule],
    controllers: [AdminStatsController],
    providers: [AdminStatsService],
})
export class AdminStatsModule { }
