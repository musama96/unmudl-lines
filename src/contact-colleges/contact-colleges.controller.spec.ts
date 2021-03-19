import { Test, TestingModule } from '@nestjs/testing';
import { ContactCollegesController } from './contact-colleges.controller';

describe('ContactColleges Controller', () => {
  let controller: ContactCollegesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactCollegesController],
    }).compile();

    controller = module.get<ContactCollegesController>(ContactCollegesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
