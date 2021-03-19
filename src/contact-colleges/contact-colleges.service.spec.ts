import { Test, TestingModule } from '@nestjs/testing';
import { ContactCollegesService } from './contact-colleges.service';

describe('ContactCollegesService', () => {
  let service: ContactCollegesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactCollegesService],
    }).compile();

    service = module.get<ContactCollegesService>(ContactCollegesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
