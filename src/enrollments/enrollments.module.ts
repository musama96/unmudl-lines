import { Module, forwardRef, HttpModule } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EnrollmentSchema } from './enrollment.model';
import { CoursesModule } from '../courses/courses.module';
import { LearnerSchema } from '../learners/learner.model';
import { PromosModule } from '../promos/promos.module';
import { PromoSchema } from '../promos/promo.model';
import { CourseSchema } from '../courses/courses.model';
import { ActivitiesModule } from '../activities/activities.module';
import { StripeModule } from '../stripe/stripe.module';
import { LearnerEnrollmentsController } from './learner-enrollments.controller';
import { UserSchema } from '../users/user.model';
import { CollegeSchema } from '../colleges/college.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { LearnersModule } from '../learners/learners.module';
import { TaxRatesModule } from '../tax-rates/tax-rates.module';
import { ExternalModule } from '../external/external.module';
import { EnquiriesModule } from '../enquiries/enquiries.module';
import { CollegesModule } from '../colleges/colleges.module';
import { GiftCourseSchema } from '../gift-a-course/gift-a-course.model';
import { EmailLogsModule } from '../email-logs/email-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'enrollments', schema: EnrollmentSchema }]),
    MongooseModule.forFeature([{ name: 'learners', schema: LearnerSchema }]),
    MongooseModule.forFeature([{ name: 'promos', schema: PromoSchema }]),
    MongooseModule.forFeature([{ name: 'courses', schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: 'users', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'colleges', schema: CollegeSchema }]),
    MongooseModule.forFeature([{ name: 'gift-course', schema: GiftCourseSchema }]),
    forwardRef(() => CoursesModule),
    forwardRef(() => CollegesModule),
    forwardRef(() => LearnersModule),
    forwardRef(() => EnquiriesModule),
    forwardRef(() => TaxRatesModule),
    forwardRef(() => EmailLogsModule),
    ExternalModule,
    PromosModule,
    ActivitiesModule,
    StripeModule,
    NotificationsModule,
  ],
  controllers: [EnrollmentsController, LearnerEnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
