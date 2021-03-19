import { Test, TestingModule } from '@nestjs/testing';
import { UnmudlAccessLogsService } from './unmudl-access-logs.service';

describe('UnmudlAccessLogsService', () => {
  let service: UnmudlAccessLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnmudlAccessLogsService],
    }).compile();

    service = module.get<UnmudlAccessLogsService>(UnmudlAccessLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
