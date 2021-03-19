import { Module } from '@nestjs/common';
import { LandingPageController } from './landing-page.controller';
import { CoursesModule } from '../courses/courses.module';
import { BlogsModule } from '../blogs/blogs.module';
import { LandingPageService } from './landing-page.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LandingPageSchema } from './landing-page.model';
import { CourseSchema } from '../courses/courses.model';
import { CollegeSchema } from '../colleges/college.model';
import { BlogSchema } from '../blogs/blog.model';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { EmployerSchema } from '../employers/employer.model';

@Module({
  imports: [
    CoursesModule,
    BlogsModule,
    RedisCacheModule,
    MongooseModule.forFeature([
      { name: 'landing-page', schema: LandingPageSchema },
      { name: 'courses', schema: CourseSchema },
      { name: 'colleges', schema: CollegeSchema },
      { name: 'blogs', schema: BlogSchema },
      { name: 'employers', schema: EmployerSchema },
    ]),
  ],
  controllers: [LandingPageController],
  providers: [LandingPageService],
})
export class LandingPageModule {}
