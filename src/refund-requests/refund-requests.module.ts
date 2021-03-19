import { forwardRef, Module } from '@nestjs/common';
import { RefundRequestsService } from './refund-requests.service';
import { RefundRequestsController } from './refund-requests.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RefundRequestSchema } from './refund-request.model';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { LearnersRefundRequestsController } from './learners-refund-requests.controller';
import { StripeModule } from '../stripe/stripe.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivitiesModule } from '../activities/activities.module';
import { UserSchema } from '../users/user.model';
import { LearnerSchema } from '../learners/learner.model';
import { CourseSchema } from '../courses/courses.model';
import { CoursesModule } from '../courses/courses.module';
import { ExternalModule } from '../external/external.module';
import { LearnersModule } from '../learners/learners.module';
import { CollegesModule } from '../colleges/colleges.module';
import { GiftCourseSchema } from '../gift-a-course/gift-a-course.model';
import { EmailLogsModule } from '../email-logs/email-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'refund-requests', schema: RefundRequestSchema },
      { name: 'users', schema: UserSchema },
      { name: 'learners', schema: LearnerSchema },
      { name: 'courses', schema: CourseSchema },
      { name: 'gift-course', schema: GiftCourseSchema },
    ]),
    EnrollmentsModule,
    forwardRef(() => CoursesModule),
    forwardRef(() => ExternalModule),
    forwardRef(() => LearnersModule),
    forwardRef(() => CollegesModule),
    forwardRef(() => EmailLogsModule),
    StripeModule,
    NotificationsModule,
    ActivitiesModule,
  ],
  controllers: [RefundRequestsController, LearnersRefundRequestsController],
  providers: [RefundRequestsService],
  exports: [RefundRequestsService],
})
export class RefundRequestsModule {}
