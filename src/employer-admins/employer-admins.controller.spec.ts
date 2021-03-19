import { Test, TestingModule } from '@nestjs/testing';
import { EmployerAdminsController } from './employer-admins.controller';

describe('EmployerAdmins Controller', () => {
  let controller: EmployerAdminsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerAdminsController],
    }).compile();

    controller = module.get<EmployerAdminsController>(EmployerAdminsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
