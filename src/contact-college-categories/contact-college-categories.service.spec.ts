import { Test, TestingModule } from '@nestjs/testing';
import { ContactCollegeCategoriesService } from './contact-college-categories.service';

describe('ContactCollegeCategoriesService', () => {
  let service: ContactCollegeCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactCollegeCategoriesService],
    }).compile();

    service = module.get<ContactCollegeCategoriesService>(ContactCollegeCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
