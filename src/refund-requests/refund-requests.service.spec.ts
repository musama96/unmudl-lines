import { Test, TestingModule } from '@nestjs/testing';
import { RefundRequestsService } from './refund-requests.service';

describe('RefundRequestsService', () => {
  let service: RefundRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefundRequestsService],
    }).compile();

    service = module.get<RefundRequestsService>(RefundRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
