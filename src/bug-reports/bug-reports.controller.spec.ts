import { Test, TestingModule } from '@nestjs/testing';
import { BugReportsController } from './bug-reports.controller';

describe('BugReports Controller', () => {
  let controller: BugReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BugReportsController],
    }).compile();

    controller = module.get<BugReportsController>(BugReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
