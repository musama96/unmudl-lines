import { Test, TestingModule } from '@nestjs/testing';
import { EmployerSubscriptionPromosService } from './employer-subscription-promos.service';

describe('EmployerSubscriptionPromosService', () => {
  let service: EmployerSubscriptionPromosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployerSubscriptionPromosService],
    }).compile();

    service = module.get<EmployerSubscriptionPromosService>(EmployerSubscriptionPromosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
