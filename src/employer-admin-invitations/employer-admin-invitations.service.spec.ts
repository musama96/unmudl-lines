import { Test, TestingModule } from '@nestjs/testing';
import { EmployerAdminInvitationsService } from './employer-admin-invitations.service';

describe('EmployerAdminInvitationsService', () => {
  let service: EmployerAdminInvitationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployerAdminInvitationsService],
    }).compile();

    service = module.get<EmployerAdminInvitationsService>(EmployerAdminInvitationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
