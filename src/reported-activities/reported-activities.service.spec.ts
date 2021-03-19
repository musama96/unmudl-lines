import { Test, TestingModule } from '@nestjs/testing';
import { ReportedActivitiesService } from './reported-activities.service';

describe('ReportedActivitiesService', () => {
  let service: ReportedActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportedActivitiesService],
    }).compile();

    service = module.get<ReportedActivitiesService>(ReportedActivitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
