import { forwardRef, Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationSchema } from './invitation.model';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
import { CollegesModule } from '../colleges/colleges.module';
import { ActivitiesModule } from '../activities/activities.module';
import { EmailLogsModule } from '../email-logs/email-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'invitations', schema: InvitationSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => CoursesModule),
    forwardRef(() => CollegesModule),
    forwardRef(() => EmailLogsModule),
    ActivitiesModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
