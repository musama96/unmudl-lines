import { Test, TestingModule } from '@nestjs/testing';
import { RefundRequestsController } from './refund-requests.controller';

describe('RefundRequests Controller', () => {
  let controller: RefundRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefundRequestsController],
    }).compile();

    controller = module.get<RefundRequestsController>(RefundRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
