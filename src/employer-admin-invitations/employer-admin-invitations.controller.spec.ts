import { Test, TestingModule } from '@nestjs/testing';
import { EmployerAdminInvitationsController } from './employer-admin-invitations.controller';

describe('EmployerAdminInvitations Controller', () => {
  let controller: EmployerAdminInvitationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployerAdminInvitationsController],
    }).compile();

    controller = module.get<EmployerAdminInvitationsController>(EmployerAdminInvitationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
