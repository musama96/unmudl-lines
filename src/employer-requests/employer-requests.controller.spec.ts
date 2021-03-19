import { Test, TestingModule } from '@nestjs/testing';
import { EmployerRequestsController } from './employer-requests.controller';

describe('EmployerRequests Controller', () => {
  let controller: EmployerRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerRequestsController],
    }).compile();

    controller = module.get<EmployerRequestsController>(EmployerRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
