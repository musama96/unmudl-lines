import { Module, forwardRef } from '@nestjs/common';
import { EmployerPostsController } from './employer-forums.controller';
import { EmployerPostsService } from './employer-forums.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployerPostSchema } from './employer-posts.model';
import { EmployerCommentSchema } from './employer-comments.model';
import { EmployerPostTagSchema } from './employer-post-tag.model';
import { CounterSchema } from '../id-counters/id-counter.model';
import { EmployerPostReportSchema } from './employer-post-report.model';
import { EmployerReplySchema } from './employer-replies.model';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employer-posts', schema: EmployerPostSchema },
      { name: 'employer-comments', schema: EmployerCommentSchema },
      { name: 'employer-replies', schema: EmployerReplySchema },
      { name: 'employer-post-tags', schema: EmployerPostTagSchema },
      { name: 'id-counters', schema: CounterSchema },
      { name: 'employer-post-reports', schema: EmployerPostReportSchema },
    ]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [EmployerPostsController],
  providers: [EmployerPostsService],
  exports: [EmployerPostsService],
})
export class EmployerForumsModule {}
