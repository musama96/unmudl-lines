import { Test, TestingModule } from '@nestjs/testing';
import { EmployerSubscriptionsService } from './employer-subscriptions.service';

describe('EmployerSubscriptionsService', () => {
  let service: EmployerSubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployerSubscriptionsService],
    }).compile();

    service = module.get<EmployerSubscriptionsService>(EmployerSubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
