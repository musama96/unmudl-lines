import { Test, TestingModule } from '@nestjs/testing';
import { ContactCollegeCategoriesController } from './contact-college-categories.controller';

describe('ContactCollegeCategories Controller', () => {
  let controller: ContactCollegeCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactCollegeCategoriesController],
    }).compile();

    controller = module.get<ContactCollegeCategoriesController>(ContactCollegeCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
