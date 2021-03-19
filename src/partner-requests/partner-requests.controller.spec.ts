import { Test, TestingModule } from '@nestjs/testing';
import { PartnerRequestsController } from './partner-requests.controller';

describe('PartnerRequests Controller', () => {
  let controller: PartnerRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerRequestsController],
    }).compile();

    controller = module.get<PartnerRequestsController>(PartnerRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
