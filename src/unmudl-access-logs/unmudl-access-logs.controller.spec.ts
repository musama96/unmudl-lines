import { Test, TestingModule } from '@nestjs/testing';
import { UnmudlAccessLogsController } from './unmudl-access-logs.controller';

describe('UnmudlAccessLogs Controller', () => {
  let controller: UnmudlAccessLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnmudlAccessLogsController],
    }).compile();

    controller = module.get<UnmudlAccessLogsController>(UnmudlAccessLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
