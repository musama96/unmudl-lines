import { Test, TestingModule } from '@nestjs/testing';
import { EmailLogsController } from './email-logs.controller';

describe('EmailLogs Controller', () => {
  let controller: EmailLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailLogsController],
    }).compile();

    controller = module.get<EmailLogsController>(EmailLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
