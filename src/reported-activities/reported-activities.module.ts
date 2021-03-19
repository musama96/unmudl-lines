import { Module } from '@nestjs/common';
import { ReportedActivitiesController } from './reported-activities.controller';
import { ReportedActivitiesService } from './reported-activities.service';
import {MongooseModule} from '@nestjs/mongoose';
import {ReportedActivitySchema} from './reported-activity.model';
import {LearnerReportedActivitiesController} from './learner-reported-activities.controller';
import {CoursesModule} from '../courses/courses.module';
import {LearnersModule} from '../learners/learners.module';
import {NotificationsModule} from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'reported-activities', schema: ReportedActivitySchema}]),
    CoursesModule, LearnersModule, NotificationsModule,
  ],
  controllers: [ReportedActivitiesController, LearnerReportedActivitiesController],
  providers: [ReportedActivitiesService],
})
export class ReportedActivitiesModule {}
