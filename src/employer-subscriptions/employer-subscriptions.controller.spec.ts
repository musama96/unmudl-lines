import { Test, TestingModule } from '@nestjs/testing';
import { EmployerSubscriptionsController } from './employer-subscriptions.controller';

describe('EmployerSubscriptions Controller', () => {
  let controller: EmployerSubscriptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerSubscriptionsController],
    }).compile();

    controller = module.get<EmployerSubscriptionsController>(EmployerSubscriptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
