import { Test, TestingModule } from '@nestjs/testing';
import { CollegeInvitationsService } from './college-invitations.service';

describe('CollegeInvitationsService', () => {
  let service: CollegeInvitationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollegeInvitationsService],
    }).compile();

    service = module.get<CollegeInvitationsService>(CollegeInvitationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
