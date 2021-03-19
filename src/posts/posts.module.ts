import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './posts.model';
import { ReplySchema } from './replies.model';
import { PostTagSchema } from './post-tag.model';
import { CounterSchema } from '../id-counters/id-counter.model';
import { PostReportSchema } from './post-report.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'posts', schema: PostSchema },
      { name: 'replies', schema: ReplySchema },
      { name: 'post-tags', schema: PostTagSchema },
      { name: 'id-counters', schema: CounterSchema },
      { name: 'post-reports', schema: PostReportSchema },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
