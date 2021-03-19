import { Test, TestingModule } from '@nestjs/testing';
import { EmployerDashboardController } from './employer-dashboard.controller';

describe('EmployerDashboard Controller', () => {
  let controller: EmployerDashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerDashboardController],
    }).compile();

    controller = module.get<EmployerDashboardController>(EmployerDashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
