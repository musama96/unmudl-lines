import { Test, TestingModule } from '@nestjs/testing';
import { SourceTalentController } from './source-talent.controller';

describe('SourceTalent Controller', () => {
  let controller: SourceTalentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourceTalentController],
    }).compile();

    controller = module.get<SourceTalentController>(SourceTalentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
