import { Test, TestingModule } from '@nestjs/testing';
import { EmployerCompaniesController } from './employer-companies.controller';

describe('EmployerCompanies Controller', () => {
  let controller: EmployerCompaniesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerCompaniesController],
    }).compile();

    controller = module.get<EmployerCompaniesController>(EmployerCompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
