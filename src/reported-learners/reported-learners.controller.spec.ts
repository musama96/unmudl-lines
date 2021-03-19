import { Test, TestingModule } from '@nestjs/testing';
import { ReportedLearnersController } from './reported-learners.controller';

describe('ReportedLearners Controller', () => {
  let controller: ReportedLearnersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportedLearnersController],
    }).compile();

    controller = module.get<ReportedLearnersController>(ReportedLearnersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
