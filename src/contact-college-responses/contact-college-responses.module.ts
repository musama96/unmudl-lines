import { forwardRef, Module } from '@nestjs/common';
import { ContactCollegeResponsesController } from './contact-college-responses.controller';
import { ContactCollegeResponsesService } from './contact-college-responses.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactCollegeResponseSchema } from './contact-college-response.model';
import { ContactCollegesModule } from '../contact-colleges/contact-colleges.module';
import { ChatModule } from '../chat/chat.module';
import { MessageSchema } from '../chat/message.model';
import { EmployerAdminSchema } from '../employer-admins/employer-admin.model';
import { UserSchema } from '../users/user.model';
import { LearnerSchema } from '../learners/learner.model';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'contact-college-responses', schema: ContactCollegeResponseSchema },
      { name: 'messages', schema: MessageSchema },
      { name: 'employer-admins', schema: EmployerAdminSchema },
      { name: 'users', schema: UserSchema },
      { name: 'learners', schema: LearnerSchema },
    ]),
    forwardRef(() => ContactCollegesModule),
    forwardRef(() => ChatModule),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [ContactCollegeResponsesController],
  providers: [ContactCollegeResponsesService],
  exports: [ContactCollegeResponsesService],
})
export class ContactCollegeResponsesModule {}
