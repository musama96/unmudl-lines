import { forwardRef, Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from './chat.model';
import { MessageSchema } from './message.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserSchema } from '../users/user.model';
import { EmployerAdminSchema } from '../employer-admins/employer-admin.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'chats', schema: ChatSchema },
      { name: 'messages', schema: MessageSchema },
      { name: 'users', schema: UserSchema },
      { name: 'employer-admins', schema: EmployerAdminSchema },
    ]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
