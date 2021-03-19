import { forwardRef, Module } from '@nestjs/common';
import { LearnersAdminController } from './learners-admin.controller';
import { LearnersService } from './learners.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LearnerSchema } from './learner.model';
import { LearnerTokenSchema } from './learnerToken.model';
import { LearnerTokensService } from './learnerTokens.service';
import { ReportedLearnersModule } from '../reported-learners/reported-learners.module';
import { EnrollmentSchema } from '../enrollments/enrollment.model';
import { LearnersController } from './learners.controller';
import { StripeModule } from '../stripe/stripe.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { CourseSchema } from '../courses/courses.model';
import { LearnersNotificationSchema } from '../notifications/learnersNotification.model';
import { CoursesModule } from '../courses/courses.module';
import { ExternalModule } from '../external/external.module';
import { EnquiriesModule } from '../enquiries/enquiries.module';
import { SourceTalentModule } from '../source-talent/source-talent.module';
import { EmailLogsModule } from '../email-logs/email-logs.module';
import { EmailLogSchema } from '../email-logs/email-logs.model';
import { ChatSchema } from '../chat/chat.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'learners', schema: LearnerSchema },
      { name: 'courses', schema: CourseSchema },
      { name: 'learner-notifications', schema: LearnersNotificationSchema },
      { name: 'email-logs', schema: EmailLogSchema },
      { name: 'chats', schema: ChatSchema },
    ]),
    MongooseModule.forFeature([{ name: 'LearnerToken', schema: LearnerTokenSchema }]),
    MongooseModule.forFeature([{ name: 'enrollments', schema: EnrollmentSchema }]),
    ReportedLearnersModule,
    ExternalModule,
    forwardRef(() => StripeModule),
    forwardRef(() => EnrollmentsModule),
    forwardRef(() => CoursesModule),
    forwardRef(() => EnquiriesModule),
    forwardRef(() => SourceTalentModule),
    forwardRef(() => EmailLogsModule),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '31536000s' },
    }),
  ],
  controllers: [LearnersAdminController, LearnersController],
  providers: [LearnersService, LearnerTokensService],
  exports: [LearnersService, LearnerTokensService],
})
export class LearnersModule {}
