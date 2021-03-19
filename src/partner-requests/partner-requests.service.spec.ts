import { Test, TestingModule } from '@nestjs/testing';
import { PartnerRequestsService } from './partner-requests.service';

describe('PartnerRequestsService', () => {
  let service: PartnerRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartnerRequestsService],
    }).compile();

    service = module.get<PartnerRequestsService>(PartnerRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
