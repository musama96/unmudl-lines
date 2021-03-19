import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivitySchema } from './activity.model';
import { UserActivityCategorySchema } from './userActivityCategory.model';
import { TransactionActivityCategorySchema } from './transactionActivityCategory.model';
import { UsersModule } from '../users/users.module';
import { UserSchema } from '../users/user.model';
import { CourseSchema } from '../courses/courses.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'activities', schema: ActivitySchema },
      { name: 'users', schema: UserSchema },
      { name: 'courses', schema: CourseSchema },
    ]),
    MongooseModule.forFeature([{ name: 'useractivitycategories', schema: UserActivityCategorySchema }]),
    MongooseModule.forFeature([{ name: 'transactionactivitycategories', schema: TransactionActivityCategorySchema }]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
