import { Module, forwardRef, HttpModule } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesLearnerController } from './courses-learner.controller';
import { CoursesService } from './courses.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema, TrashedCourseSchema } from './courses.model';
import { RatingCategoriesSchema } from './courses.model';
import { LearnerSchema } from '../learners/learner.model';
import { ActivitiesModule } from '../activities/activities.module';
import { PromoSchema } from '../promos/promo.model';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { ReviewSchema } from './review.model';
import { PerformanceOutcomesSchema } from './performanceOutcomes.model';
import { EmployersModule } from '../employers/employers.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CounterSchema } from '../id-counters/id-counter.model';
import { LearnersModule } from '../learners/learners.module';
import { UserSchema } from '../users/user.model';
import { PromosModule } from '../promos/promos.module';
import { CipCertificatesSchema } from './cip-certificates.model';
import { CollegeSchema } from '../colleges/college.model';
import { LevelAnchorsSchema } from './level-anchors.model';
import { CourseDraftSchema } from './course-draft.model';
import { LandingPageSchema } from '../landing-page/landing-page.model';
import { EnquiriesModule } from '../enquiries/enquiries.module';
import { TaxRatesModule } from '../tax-rates/tax-rates.module';
import { BlogSchema } from '../blogs/blog.model';
import { EnrollmentSchema } from '../enrollments/enrollment.model';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { CollegesModule } from '../colleges/colleges.module';
import { CourseCategorySchema } from './course-categories.model';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { EmployerSchema } from '../employers/employer.model';
import { EmailLogsModule } from '../email-logs/email-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'courses', schema: CourseSchema },
      { name: 'trashed-courses', schema: TrashedCourseSchema },
      { name: 'promos', schema: PromoSchema },
      { name: 'reviews', schema: ReviewSchema },
      { name: 'performance-outcomes', schema: PerformanceOutcomesSchema },
      { name: 'id-counters', schema: CounterSchema },
      { name: 'users', schema: UserSchema },
      { name: 'cip-certificates', schema: CipCertificatesSchema },
      { name: 'colleges', schema: CollegeSchema },
      { name: 'level-anchors', schema: LevelAnchorsSchema },
      { name: 'course-drafts', schema: CourseDraftSchema },
      { name: 'landing-page', schema: LandingPageSchema },
      { name: 'blogs', schema: BlogSchema },
      { name: 'enrollments', schema: EnrollmentSchema },
      { name: 'learners', schema: LearnerSchema },
      { name: 'ratingCategories', schema: RatingCategoriesSchema },
      { name: 'course-categories', schema: CourseCategorySchema },
      { name: 'employers', schema: EmployerSchema },
    ]),
    ActivitiesModule,
    EmployersModule,
    NotificationsModule,
    LearnersModule,
    PromosModule,
    ActivitiesModule,
    EnquiriesModule,
    RedisCacheModule,
    forwardRef(() => EnrollmentsModule),
    forwardRef(() => CollegesModule),
    forwardRef(() => UsersModule),
    forwardRef(() => HttpModule),
    forwardRef(() => TaxRatesModule),
    forwardRef(() => EmailLogsModule),
    forwardRef(() => CollegesModule),
  ],
  providers: [CoursesService],
  controllers: [CoursesController, CoursesLearnerController],
  exports: [CoursesService],
})
export class CoursesModule {}
