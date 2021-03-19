import { Test, TestingModule } from '@nestjs/testing';
import { SitemapsController } from './sitemaps.controller';

describe('Sitemaps Controller', () => {
  let controller: SitemapsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitemapsController],
    }).compile();

    controller = module.get<SitemapsController>(SitemapsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
