import { Test, TestingModule } from '@nestjs/testing';
import { EmployerSubscriptionPromosController } from './employer-subscription-promos.controller';

describe('EmployerSubscriptionPromos Controller', () => {
  let controller: EmployerSubscriptionPromosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerSubscriptionPromosController],
    }).compile();

    controller = module.get<EmployerSubscriptionPromosController>(EmployerSubscriptionPromosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
