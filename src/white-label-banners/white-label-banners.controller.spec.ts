import { Test, TestingModule } from '@nestjs/testing';
import { WhiteLabelBannersController } from './white-label-banners.controller';

describe('WhiteLabelBanners Controller', () => {
  let controller: WhiteLabelBannersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhiteLabelBannersController],
    }).compile();

    controller = module.get<WhiteLabelBannersController>(WhiteLabelBannersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
