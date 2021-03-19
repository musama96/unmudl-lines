import { Test, TestingModule } from '@nestjs/testing';
import { EmailLogsService } from './email-logs.service';

describe('EmailLogsService', () => {
  let service: EmailLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailLogsService],
    }).compile();

    service = module.get<EmailLogsService>(EmailLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
