import { forwardRef, Module } from '@nestjs/common';
import { EmployerAdminsController } from './employer-admins.controller';
import { EmployerAdminsService } from './employer-admins.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployerAdminSchema, TrashedEmployerAdminSchema } from './employer-admin.model';
import { EmployerAdminTokenSchema } from './employer-admin-token.model';
import { CounterSchema } from '../id-counters/id-counter.model';
import { EmployerAdminInvitationsModule } from '../employer-admin-invitations/employer-admin-invitations.module';
import { EmployerAdminInvitationSchema } from '../employer-admin-invitations/employer-admin-invitation.model';
import { EmployerAdminsNotificationSchema } from '../notifications/employerAdminsNotification.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { StripeModule } from '../stripe/stripe.module';
import { EmailLogsModule } from '../email-logs/email-logs.module';
import { ChatModule } from '../chat/chat.module';
import { EmployerSubscriptionsModule } from 'src/employer-subscriptions/employer-subscriptions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employer-admins', schema: EmployerAdminSchema },
      { name: 'employer-admin-invitations', schema: EmployerAdminInvitationSchema },
      { name: 'trashed-employer-admins', schema: TrashedEmployerAdminSchema },
      { name: 'employer-admin-tokens', schema: EmployerAdminTokenSchema },
      { name: 'employer-admin-notifications', schema: EmployerAdminsNotificationSchema },
      { name: 'id-counters', schema: CounterSchema },
    ]),
    forwardRef(() => EmployerAdminInvitationsModule),
    forwardRef(() => EmployerSubscriptionsModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => StripeModule),
    forwardRef(() => EmailLogsModule),
    forwardRef(() => ChatModule),
  ],
  controllers: [EmployerAdminsController],
  providers: [EmployerAdminsService],
  exports: [EmployerAdminsService],
})
export class EmployerAdminsModule {}
