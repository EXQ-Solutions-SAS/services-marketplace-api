import { Test, TestingModule } from '@nestjs/testing';
import { AdminStatsController } from './admin-stats.controller';

describe('AdminStatsController', () => {
  let controller: AdminStatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminStatsController],
    }).compile();

    controller = module.get<AdminStatsController>(AdminStatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
