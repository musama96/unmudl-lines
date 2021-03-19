import { forwardRef, Module } from '@nestjs/common';
import { EmployerAdminInvitationsService } from './employer-admin-invitations.service';
import { EmployerAdminInvitationsController } from './employer-admin-invitations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployerAdminInvitationSchema } from './employer-admin-invitation.model';
import { EmployerAdminsModule } from '../employer-admins/employer-admins.module';
import { EmployerCompaniesModule } from '../employer-companies/employer-companies.module';
import { ActivitiesModule } from '../activities/activities.module';
import { EmployerAdminSchema } from '../employer-admins/employer-admin.model';
import { EmailLogsModule } from '../email-logs/email-logs.module';
import { StripeModule } from '../stripe/stripe.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'employer-admin-invitations', schema: EmployerAdminInvitationSchema }]),
    MongooseModule.forFeature([{ name: 'employer-admins', schema: EmployerAdminSchema }]),
    forwardRef(() => EmployerAdminsModule),
    forwardRef(() => EmployerCompaniesModule),
    forwardRef(() => EmailLogsModule),
    forwardRef(() => StripeModule),
    forwardRef(() => ChatModule),
    ActivitiesModule,
  ],
  providers: [EmployerAdminInvitationsService],
  controllers: [EmployerAdminInvitationsController],
  exports: [EmployerAdminInvitationsService],
})
export class EmployerAdminInvitationsModule {}
