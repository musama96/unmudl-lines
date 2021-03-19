import { Test, TestingModule } from '@nestjs/testing';
import { SourceTalentService } from './source-talent.service';

describe('SourceTalentService', () => {
  let service: SourceTalentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SourceTalentService],
    }).compile();

    service = module.get<SourceTalentService>(SourceTalentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
