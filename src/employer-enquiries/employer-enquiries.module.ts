import { Module } from '@nestjs/common';
import { EmployerEnquiriesController } from './employer-enquiries.controller';
import { EmployerEnquiriesService } from './employer-enquiries.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployerEnquiryMessageSchema } from './employer-enquiry-message.model';
import { CourseSchema } from '../courses/courses.model';
import { LearnerSchema } from '../learners/learner.model';
import { EmployerEnquirySchema } from './employer-enquiry.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmployerAdminSchema } from '../employer-admins/employer-admin.model';
import { CollegeSchema } from '../colleges/college.model';
import { UserSchema } from '../users/user.model';
import { MailerModule } from '@nest-modules/mailer';
import { EmailLogsModule } from '../email-logs/email-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employer-enquiries', schema: EmployerEnquirySchema },
      { name: 'employer-enquiry-messages', schema: EmployerEnquiryMessageSchema },
      { name: 'employer-admins', schema: EmployerAdminSchema },
      { name: 'colleges', schema: CollegeSchema },
      { name: 'users', schema: UserSchema },
    ]),
    NotificationsModule,
    MailerModule,
    EmailLogsModule,
  ],
  controllers: [EmployerEnquiriesController],
  providers: [EmployerEnquiriesService],
  exports: [EmployerEnquiriesService],
})
export class EmployerEnquiriesModule {}
