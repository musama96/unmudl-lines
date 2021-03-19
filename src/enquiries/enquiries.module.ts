import { Module, forwardRef } from '@nestjs/common';
import { EnquiriesController } from './enquiries.controller';
import { EnquiriesService } from './enquiries.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EnquiryMessageSchema } from './enquiry-message.model';
import { CourseSchema } from '../courses/courses.model';
import { LearnerSchema } from '../learners/learner.model';
import { EnquirySchema } from './enquiry.model';
import { LearnerEnquiriesController } from './learner-enquiries.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailLogsModule } from '../email-logs/email-logs.module';
import { ChatSchema } from '../chat/chat.model';
import { MessageSchema } from '../chat/message.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'enquiries', schema: EnquirySchema },
      { name: 'enquiry-messages', schema: EnquiryMessageSchema },
      { name: 'courses', schema: CourseSchema },
      { name: 'learners', schema: LearnerSchema },
      { name: 'chats', schema: ChatSchema },
      { name: 'messages', schema: MessageSchema },
    ]),
    NotificationsModule,
    forwardRef(() => EmailLogsModule),
  ],
  controllers: [EnquiriesController, LearnerEnquiriesController],
  providers: [EnquiriesService],
  exports: [EnquiriesService],
})
export class EnquiriesModule {}
