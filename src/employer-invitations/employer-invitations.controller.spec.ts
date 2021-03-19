import { Test, TestingModule } from '@nestjs/testing';
import { EmployerInvitationsController } from './employer-invitations.controller';

describe('EmployerInvitations Controller', () => {
  let controller: EmployerInvitationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerInvitationsController],
    }).compile();

    controller = module.get<EmployerInvitationsController>(EmployerInvitationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
