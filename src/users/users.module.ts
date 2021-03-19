import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, TrashedUserSchema } from './user.model';
import { CourseSchema } from '../courses/courses.model';
import { UserTokenSchema } from './userToken.model';
import { UsersService } from './users.service';
import { UserTokensService } from './userTokens.service';
import { UsersController } from './users.controller';
import { InvitationsModule } from '../invitations/invitations.module';
import { ActivitiesModule } from '../activities/activities.module';
import { StripeModule } from '../stripe/stripe.module';
import { CollegesModule } from '../colleges/colleges.module';
import { PayoutsModule } from '../payouts/payouts.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { InvitationSchema } from '../invitations/invitation.model';
import { CounterSchema } from '../id-counters/id-counter.model';
import { UsersNotificationSchema } from '../notifications/usersNotification.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivitySchema } from '../activities/activity.model';
import { EmailLogsModule } from '../email-logs/email-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'users', schema: UserSchema },
      { name: 'user-notifications', schema: UsersNotificationSchema },
      { name: 'activities', schema: ActivitySchema },
    ]),
    MongooseModule.forFeature([{ name: 'trashedUsers', schema: TrashedUserSchema }]),
    MongooseModule.forFeature([{ name: 'UserToken', schema: UserTokenSchema }]),
    MongooseModule.forFeature([{ name: 'courses', schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: 'invitations', schema: InvitationSchema }]),
    MongooseModule.forFeature([{ name: 'id-counters', schema: CounterSchema }]),
    forwardRef(() => InvitationsModule),
    forwardRef(() => StripeModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => CollegesModule),
    forwardRef(() => EmailLogsModule),
    ActivitiesModule,
    PayoutsModule,
    TransactionsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserTokensService],
  exports: [UsersService, UserTokensService],
})
export class UsersModule {}
