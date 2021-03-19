import { Module, forwardRef } from '@nestjs/common';
import { PartnerRequestsController } from './partner-requests.controller';
import { PartnerRequestsService } from './partner-requests.service';
import {MongooseModule} from '@nestjs/mongoose';
import {PartnerRequestSchema} from './partner-request.model';
import {LearnerPartnerRequestsController} from './learner-partner-requests.controller';
import {NotificationsModule} from '../notifications/notifications.module';
import { UserSchema } from '../users/user.model';
import { EmailLogsModule } from '../email-logs/email-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'partner-requests', schema: PartnerRequestSchema },
      { name: 'users', schema: UserSchema },
    ]),
    NotificationsModule,
    forwardRef(() => EmailLogsModule),
  ],
  controllers: [PartnerRequestsController, LearnerPartnerRequestsController],
  providers: [PartnerRequestsService],
  exports: [PartnerRequestsService],
})
export class PartnerRequestsModule {}
