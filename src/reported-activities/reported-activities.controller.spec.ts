import { Test, TestingModule } from '@nestjs/testing';
import { ReportedActivitiesController } from './reported-activities.controller';

describe('ReportedActivities Controller', () => {
  let controller: ReportedActivitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportedActivitiesController],
    }).compile();

    controller = module.get<ReportedActivitiesController>(ReportedActivitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
