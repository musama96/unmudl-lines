import { Test, TestingModule } from '@nestjs/testing';
import { LearnersAdminController } from './learners-admin.controller';
// import { LearnersController } from './learners-admin.controller';

describe('Learners Controller', () => {
  let controller: LearnersAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearnersAdminController],
    }).compile();

    controller = module.get<LearnersAdminController>(LearnersAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
