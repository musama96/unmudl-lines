import { Test, TestingModule } from '@nestjs/testing';
import { ContactCollegeResponsesController } from './contact-college-responses.controller';

describe('ContactCollegeResponses Controller', () => {
  let controller: ContactCollegeResponsesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactCollegeResponsesController],
    }).compile();

    controller = module.get<ContactCollegeResponsesController>(ContactCollegeResponsesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
