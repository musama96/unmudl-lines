import { Test, TestingModule } from '@nestjs/testing';
import { EmployerIndustriesController } from './employer-industries.controller';

describe('EmployerIndustries Controller', () => {
  let controller: EmployerIndustriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerIndustriesController],
    }).compile();

    controller = module.get<EmployerIndustriesController>(EmployerIndustriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
