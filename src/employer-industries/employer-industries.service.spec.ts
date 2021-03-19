import { Test, TestingModule } from '@nestjs/testing';
import { EmployerIndustriesService } from './employer-industries.service';

describe('EmployerIndustriesService', () => {
  let service: EmployerIndustriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployerIndustriesService],
    }).compile();

    service = module.get<EmployerIndustriesService>(EmployerIndustriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
