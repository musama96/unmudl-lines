import { Module } from '@nestjs/common';
import { InternalChatController } from './internal-chat.controller';
import { InternalChatService } from './internal-chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGroupSchema } from './chat-group.model';
import { ChatMessageSchema } from './chat-message.model';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'chat-groups', schema: ChatGroupSchema },
      { name: 'chat-messages', schema: ChatMessageSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [InternalChatController],
  providers: [InternalChatService],
})
export class InternalChatModule {}
