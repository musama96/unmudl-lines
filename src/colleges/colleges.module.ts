import { Module, forwardRef } from '@nestjs/common';
import { CollegesController } from './colleges.controller';
import { LearnersCollegesController } from './learners-colleges.controller';
import { CollegesService } from './colleges.service';
import { UsersModule } from '../users/users.module';
import { CollegeSchema } from './college.model';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentSchema } from '../enrollments/enrollment.model';
import { CourseSchema } from '../courses/courses.model';
import { UserSchema } from '../users/user.model';
import { StripeModule } from '../stripe/stripe.module';
import { PayoutsModule } from '../payouts/payouts.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { CoursesModule } from '../courses/courses.module';
import { CounterSchema } from '../id-counters/id-counter.model';
import { CollegeInvitationSchema } from '../college-invitations/college-invitation.model';
import { CollegeTokenSchema } from '../college-invitations/collegeToken.model';
import { CollegeInvitationsModule } from '../college-invitations/college-invitations.module';
import { ActivitiesModule } from '../activities/activities.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LandingPageSchema } from '../landing-page/landing-page.model';
import { EmployerCompanySchema } from '../employer-companies/employer-company.model';
import { EmployerSchema } from '../employers/employer.model';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { UnmudlAccessLogsModule } from '../unmudl-access-logs/unmudl-access-logs.module';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'colleges', schema: CollegeSchema },
      { name: 'college-invitations', schema: CollegeInvitationSchema },
      { name: 'collegetokens', schema: CollegeTokenSchema },
      { name: 'landing-pages', schema: LandingPageSchema },
      { name: 'employer-companies', schema: EmployerCompanySchema },
      { name: 'employers', schema: EmployerSchema },
    ]),
    MongooseModule.forFeature([{ name: 'enrollments', schema: EnrollmentSchema }]),
    MongooseModule.forFeature([{ name: 'courses', schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: 'users', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'id-counters', schema: CounterSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => StripeModule),
    PayoutsModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
    forwardRef(() => CollegeInvitationsModule),
    ActivitiesModule,
    NotificationsModule,
    UnmudlAccessLogsModule,
    forwardRef(() => EnrollmentsModule),
    forwardRef(() => CoursesModule),
  ],
  controllers: [CollegesController, LearnersCollegesController],
  providers: [CollegesService],
  exports: [CollegesService],
})
export class CollegesModule {}
