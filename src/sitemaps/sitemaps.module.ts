import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { CollegeSchema } from '../colleges/college.model';
import { CourseSchema } from '../courses/courses.model';
import { SitemapsController } from './sitemaps.controller';
import { SitemapsService } from './sitemaps.service';

@Module({
  imports: [
    RedisCacheModule,
    MongooseModule.forFeature([
      { name: 'colleges', schema: CollegeSchema },
      { name: 'courses', schema: CourseSchema },
    ]),
  ],
  controllers: [SitemapsController],
  providers: [SitemapsService]
})
export class SitemapsModule {}
