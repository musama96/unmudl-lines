import { Test, TestingModule } from '@nestjs/testing';
import { CourseSuggestionsController } from './course-suggestions.controller';

describe('CourseSuggestions Controller', () => {
  let controller: CourseSuggestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseSuggestionsController],
    }).compile();

    controller = module.get<CourseSuggestionsController>(CourseSuggestionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
