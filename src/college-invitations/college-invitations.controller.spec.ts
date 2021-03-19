import { Test, TestingModule } from '@nestjs/testing';
import { CollegeInvitationsController } from './college-invitations.controller';

describe('CollegeInvitations Controller', () => {
  let controller: CollegeInvitationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollegeInvitationsController],
    }).compile();

    controller = module.get<CollegeInvitationsController>(CollegeInvitationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
