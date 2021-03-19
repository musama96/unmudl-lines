import { Test, TestingModule } from '@nestjs/testing';
import { ContactCollegeResponsesService } from './contact-college-responses.service';

describe('ContactCollegeResponsesService', () => {
  let service: ContactCollegeResponsesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactCollegeResponsesService],
    }).compile();

    service = module.get<ContactCollegeResponsesService>(ContactCollegeResponsesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
