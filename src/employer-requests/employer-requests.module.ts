import { Module, forwardRef } from '@nestjs/common';
import { EmployerRequestsController } from './employer-requests.controller';
import { EmployerRequestsService } from './employer-requests.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployerRequestSchema } from './employer-request.model';
import { UserSchema } from '../users/user.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { LearnerEmployerRequestsController } from './learner-employer-requests.controller';
import { EmailLogsModule } from '../email-logs/email-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employer-requests', schema: EmployerRequestSchema },
      { name: 'users', schema: UserSchema },
    ]),
    NotificationsModule,
    forwardRef(() => EmailLogsModule),
  ],
  controllers: [EmployerRequestsController, LearnerEmployerRequestsController],
  providers: [EmployerRequestsService],
  exports: [EmployerRequestsService],
})
export class EmployerRequestsModule {}
