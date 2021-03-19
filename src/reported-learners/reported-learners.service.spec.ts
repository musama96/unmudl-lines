import { Test, TestingModule } from '@nestjs/testing';
import { ReportedLearnersService } from './reported-learners.service';

describe('ReportedLearnersService', () => {
  let service: ReportedLearnersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportedLearnersService],
    }).compile();

    service = module.get<ReportedLearnersService>(ReportedLearnersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
