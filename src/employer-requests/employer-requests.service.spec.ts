import { Test, TestingModule } from '@nestjs/testing';
import { EmployerRequestsService } from './employer-requests.service';

describe('EmployerRequestsService', () => {
  let service: EmployerRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployerRequestsService],
    }).compile();

    service = module.get<EmployerRequestsService>(EmployerRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
