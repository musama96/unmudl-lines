import { forwardRef, Module } from '@nestjs/common';
import { EmployerCompaniesController } from './employer-companies.controller';
import { EmployerCompaniesService } from './employer-companies.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployerCompanySchema } from './employer-company.model';
import { EmployerAdminsModule } from '../employer-admins/employer-admins.module';
import { EmployerInvitationsModule } from '../employer-invitations/employer-invitations.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EnrollmentCompanyTokenSchema } from './enrollment-company-token.model';
import { LearnersEmployerCompaniesController } from './learners-employer-companies.controller';
import { EmployerInvitationSchema } from '../employer-invitations/employer-invitation.model';
import { EmployerAdminSchema } from '../employer-admins/employer-admin.model';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { CollegesModule } from '../colleges/colleges.module';
import { EmployersModule } from '../employers/employers.module';
import { UnmudlAccessLogsModule } from '../unmudl-access-logs/unmudl-access-logs.module';
import { EmployerAdminInvitationsModule } from '../employer-admin-invitations/employer-admin-invitations.module';
import { EmployerSubscriptionsModule } from 'src/employer-subscriptions/employer-subscriptions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employer-companies', schema: EmployerCompanySchema },
      { name: 'employer-company-tokens', schema: EnrollmentCompanyTokenSchema },
      { name: 'employer-invitations', schema: EmployerInvitationSchema },
      { name: 'employer-admins', schema: EmployerAdminSchema },
    ]),
    forwardRef(() => EmployerAdminsModule),
    forwardRef(() => EmployerInvitationsModule),
    forwardRef(() => EmployerAdminInvitationsModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => CollegesModule),
    forwardRef(() => EmployersModule),
    forwardRef(() => EmployerSubscriptionsModule),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
    UnmudlAccessLogsModule,
  ],
  controllers: [EmployerCompaniesController, LearnersEmployerCompaniesController],
  providers: [EmployerCompaniesService],
  exports: [EmployerCompaniesService],
})
export class EmployerCompaniesModule {}
