import { Test, TestingModule } from '@nestjs/testing';
import { EmployerInvitationsService } from './employer-invitations.service';

describe('EmployerInvitationsService', () => {
  let service: EmployerInvitationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployerInvitationsService],
    }).compile();

    service = module.get<EmployerInvitationsService>(EmployerInvitationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
