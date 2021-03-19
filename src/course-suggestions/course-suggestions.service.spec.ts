import { Test, TestingModule } from '@nestjs/testing';
import { CourseSuggestionsService } from './course-suggestions.service';

describe('CourseSuggestionsService', () => {
  let service: CourseSuggestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseSuggestionsService],
    }).compile();

    service = module.get<CourseSuggestionsService>(CourseSuggestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
