import { Test, TestingModule } from '@nestjs/testing';
import { GiftACourseController } from './gift-a-course.controller';

describe('GiftACourse Controller', () => {
  let controller: GiftACourseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiftACourseController],
    }).compile();

    controller = module.get<GiftACourseController>(GiftACourseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
