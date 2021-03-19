import { Test, TestingModule } from '@nestjs/testing';
import { WhiteLabelBannersService } from './white-label-banners.service';

describe('WhiteLabelBannersService', () => {
  let service: WhiteLabelBannersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhiteLabelBannersService],
    }).compile();

    service = module.get<WhiteLabelBannersService>(WhiteLabelBannersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
