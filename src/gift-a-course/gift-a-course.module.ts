import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from '../courses/courses.model';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentSchema } from '../enrollments/enrollment.model';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { LearnerSchema } from '../learners/learner.model';
import { LearnersModule } from '../learners/learners.module';
import { PromoSchema } from '../promos/promo.model';
import { PromosModule } from '../promos/promos.module';
import { StripeModule } from '../stripe/stripe.module';
import { UserSchema } from '../users/user.model';
import { GiftACourseController } from './gift-a-course.controller';
import { GiftCourseSchema } from './gift-a-course.model';
import { GiftACourseService } from './gift-a-course.service';
import { EmailLogsModule } from '../email-logs/email-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { schema: GiftCourseSchema, name: 'gift-course' },
      { schema: PromoSchema, name: 'promos' },
      { schema: EnrollmentSchema, name: 'enrollments' },
      { schema: CourseSchema, name: 'courses' },
      { schema: LearnerSchema, name: 'learners' },
      { schema: UserSchema, name: 'users' },
    ]),
    forwardRef(() => EnrollmentsModule),
    forwardRef(() => LearnersModule),
    forwardRef(() => CoursesModule),
    forwardRef(() => StripeModule),
    forwardRef(() => PromosModule),
    forwardRef(() => EmailLogsModule),
  ],
  controllers: [GiftACourseController],
  providers: [GiftACourseService],
  exports: [GiftACourseService],
})
export class GiftACourseModule {}
