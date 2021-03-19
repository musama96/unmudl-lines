import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { UsersNotificationSchema } from './usersNotification.model';
import { LearnersNotificationSchema } from './learnersNotification.model';
import { CourseSchema } from '../courses/courses.model';
import { EnrollmentSchema } from '../enrollments/enrollment.model';
import { UserSchema } from '../users/user.model';
import { LearnerSchema } from '../learners/learner.model';
import { EmployerAdminsNotificationSchema } from './employerAdminsNotification.model';
import { EmployerAdminSchema } from '../employer-admins/employer-admin.model';
import { LandingPageSchema } from '../landing-page/landing-page.model';
import { EmailLogsModule } from '../email-logs/email-logs.module';
import { EmployerReplySchema } from '../employer-forums/employer-replies.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'user-notifications', schema: UsersNotificationSchema },
      { name: 'learner-notifications', schema: LearnersNotificationSchema },
      { name: 'employer-admin-notifications', schema: EmployerAdminsNotificationSchema },
      { name: 'courses', schema: CourseSchema },
      { name: 'enrollments', schema: EnrollmentSchema },
      { name: 'users', schema: UserSchema },
      { name: 'learners', schema: LearnerSchema },
      { name: 'employer-admins', schema: EmployerAdminSchema },
      { name: 'landing-page', schema: LandingPageSchema },
      { name: 'employer-replies', schema: EmployerReplySchema },
    ]),
    forwardRef(() => EmailLogsModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
