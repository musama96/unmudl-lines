import { Test, TestingModule } from '@nestjs/testing';
import { BlogTagsController } from './blog-tags.controller';

describe('BlogTags Controller', () => {
  let controller: BlogTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogTagsController],
    }).compile();

    controller = module.get<BlogTagsController>(BlogTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
