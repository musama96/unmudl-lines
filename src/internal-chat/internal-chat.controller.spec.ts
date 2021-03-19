import { Test, TestingModule } from '@nestjs/testing';
import { InternalChatController } from './internal-chat.controller';

describe('InternalChat Controller', () => {
  let controller: InternalChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternalChatController],
    }).compile();

    controller = module.get<InternalChatController>(InternalChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
