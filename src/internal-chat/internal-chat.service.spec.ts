import { Test, TestingModule } from '@nestjs/testing';
import { InternalChatService } from './internal-chat.service';

describe('InternalChatService', () => {
  let service: InternalChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InternalChatService],
    }).compile();

    service = module.get<InternalChatService>(InternalChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
