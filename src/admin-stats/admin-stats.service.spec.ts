import { Test, TestingModule } from '@nestjs/testing';
import { AdminStatsService } from './admin-stats.service';

describe('AdminStatsService', () => {
  let service: AdminStatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminStatsService],
    }).compile();

    service = module.get<AdminStatsService>(AdminStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
