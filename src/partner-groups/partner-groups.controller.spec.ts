import { Test, TestingModule } from '@nestjs/testing';
import { PartnerGroupsController } from './partner-groups.controller';

describe('PartnerGroups Controller', () => {
  let controller: PartnerGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartnerGroupsController],
    }).compile();

    controller = module.get<PartnerGroupsController>(PartnerGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
