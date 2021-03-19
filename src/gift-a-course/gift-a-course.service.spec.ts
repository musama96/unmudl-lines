import { Test, TestingModule } from '@nestjs/testing';
import { GiftACourseService } from './gift-a-course.service';

describe('GiftACourseService', () => {
  let service: GiftACourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GiftACourseService],
    }).compile();

    service = module.get<GiftACourseService>(GiftACourseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
