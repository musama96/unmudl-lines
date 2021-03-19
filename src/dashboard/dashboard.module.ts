import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import {EnrollmentsModule} from '../enrollments/enrollments.module';
import {CoursesModule} from '../courses/courses.module';
import {LearnersModule} from '../learners/learners.module';
import {CollegesModule} from '../colleges/colleges.module';
import {UsersModule} from '../users/users.module';

@Module({
  imports: [
    EnrollmentsModule, CoursesModule, LearnersModule, CollegesModule, UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
