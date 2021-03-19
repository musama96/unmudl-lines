import { forwardRef, Module } from '@nestjs/common';
import { EmployerInvitationsController } from './employer-invitations.controller';
import { EmployerInvitationsService } from './employer-invitations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployerInvitationSchema } from './employer-invitation.model';
import { EmployerAdminsModule } from '../employer-admins/employer-admins.module';
import { CounterSchema } from '../id-counters/id-counter.model';
import { EmployerCompanySchema } from '../employer-companies/employer-company.model';
import { EmployerAdminTokenSchema } from '../employer-admins/employer-admin-token.model';
import { EmployerAdminSchema } from '../employer-admins/employer-admin.model';
import { EnrollmentCompanyTokenSchema } from '../employer-companies/enrollment-company-token.model';
import { EmailLogsModule } from '../email-logs/email-logs.module';
import { EmployerSubscriptionsModule } from '../employer-subscriptions/employer-subscriptions.module';
import { StripeModule } from '../stripe/stripe.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employer-invitations', schema: EmployerInvitationSchema },
      { name: 'employer-companies', schema: EmployerCompanySchema },
      { name: 'employer-admin-tokens', schema: EmployerAdminTokenSchema },
      { name: 'employer-admins', schema: EmployerAdminSchema },
      { name: 'id-counters', schema: CounterSchema },
      { name: 'employer-company-tokens', schema: EnrollmentCompanyTokenSchema },
    ]),
    forwardRef(() => EmployerAdminsModule),
    forwardRef(() => EmailLogsModule),
    forwardRef(() => EmployerSubscriptionsModule),
    forwardRef(() => StripeModule),
    forwardRef(() => ChatModule),
  ],
  controllers: [EmployerInvitationsController],
  providers: [EmployerInvitationsService],
  exports: [EmployerInvitationsService],
})
export class EmployerInvitationsModule {}
