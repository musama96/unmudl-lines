import { Module } from '@nestjs/common';
import { BlogTagsController } from './blog-tags.controller';
import { BlogTagsService } from './blog-tags.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogTagSchema } from './blog-tag.model';
import { BlogSchema } from '../blogs/blog.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'blog-tags', schema: BlogTagSchema },
      { name: 'blogs', schema: BlogSchema },
    ]),
  ],
  controllers: [BlogTagsController],
  providers: [BlogTagsService],
  exports: [BlogTagsService],
})
export class BlogTagsModule {}
