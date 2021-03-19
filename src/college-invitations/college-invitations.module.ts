import { Module, forwardRef } from '@nestjs/common';
import { CollegeInvitationsController } from './college-invitations.controller';
import { CollegeInvitationsService } from './college-invitations.service';
import { CollegeInvitationSchema } from './college-invitation.model';
import { MongooseModule } from '@nestjs/mongoose';
import { CollegeSchema } from '../colleges/college.model';
import { CounterSchema } from '../id-counters/id-counter.model';
import { CollegeTokenSchema } from './collegeToken.model';
import { UsersModule } from '../users/users.module';
import { UserSchema } from '../users/user.model';
import { PartnerRequestsModule } from '../partner-requests/partner-requests.module';
import { EmployerInvitationsModule } from '../employer-invitations/employer-invitations.module';
import { EmployerRequestsModule } from '../employer-requests/employer-requests.module';
import { EmailLogsModule } from '../email-logs/email-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'college-invitations', schema: CollegeInvitationSchema },
      { name: 'colleges', schema: CollegeSchema },
      { name: 'collegetokens', schema: CollegeTokenSchema },
      { name: 'id-counters', schema: CounterSchema },
      { name: 'users', schema: UserSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => EmailLogsModule),
    PartnerRequestsModule,
    EmployerInvitationsModule,
    EmployerRequestsModule,
  ],
  controllers: [CollegeInvitationsController],
  providers: [CollegeInvitationsService],
  exports: [CollegeInvitationsService],
})
export class CollegeInvitationsModule {}
