import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminStatsService } from './admin-stats.service';
import { RolesGuard } from '../auth/guards/roles.guard'; // Tu guard de roles
import { Roles } from '../auth/decorators/roles.decorator';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';

@Controller('admin-stats')
@UseGuards(FirebaseAuthGuard)
export class AdminStatsController {
    constructor(private readonly statsService: AdminStatsService) { }

    @Get('summary')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async getSummary() {
        return this.statsService.getDashboardSummary();
    }

    @Get('revenue-history')
    @UseGuards(FirebaseAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async getHistory() {
        return this.statsService.getRevenueHistory();
    }
}