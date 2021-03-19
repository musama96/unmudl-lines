import { Test, TestingModule } from '@nestjs/testing';
import { EmployerCompaniesService } from './employer-companies.service';

describe('EmployerCompaniesService', () => {
  let service: EmployerCompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployerCompaniesService],
    }).compile();

    service = module.get<EmployerCompaniesService>(EmployerCompaniesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
