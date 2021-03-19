import { Test, TestingModule } from '@nestjs/testing';
import { PartnerGroupsService } from './partner-groups.service';

describe('PartnerGroupsService', () => {
  let service: PartnerGroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartnerGroupsService],
    }).compile();

    service = module.get<PartnerGroupsService>(PartnerGroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
