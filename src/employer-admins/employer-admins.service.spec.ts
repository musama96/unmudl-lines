import { Test, TestingModule } from '@nestjs/testing';
import { EmployerAdminsService } from './employer-admins.service';

describe('EmployerAdminsService', () => {
  let service: EmployerAdminsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployerAdminsService],
    }).compile();

    service = module.get<EmployerAdminsService>(EmployerAdminsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
