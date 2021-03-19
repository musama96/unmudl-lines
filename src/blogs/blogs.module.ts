import { Module } from '@nestjs/common';
import { BlogsController } from './blogs.controller';
import { LearnersBlogsController } from './learner-blogs.controller';
import { BlogsService } from './blogs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogSchema, TrashedBlogSchema } from './blog.model';
import { CounterSchema } from '../id-counters/id-counter.model';
import { BlogTagSchema } from '../blog-tags/blog-tag.model';
import { BlogTagsModule } from '../blog-tags/blog-tags.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmployerCompanySchema } from 'src/employer-companies/employer-company.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'blogs', schema: BlogSchema },
      { name: 'id-counters', schema: CounterSchema },
      { name: 'blog-tags', schema: BlogTagSchema },
      { name: 'trashedBlogs', schema: TrashedBlogSchema },
      { name: 'employer-companies', schema: EmployerCompanySchema },
    ]),
    BlogTagsModule,
    NotificationsModule,
  ],
  controllers: [BlogsController, LearnersBlogsController],
  providers: [BlogsService],
  exports: [BlogsService],
})
export class BlogsModule {}
