import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler from '../common/ResponseHandler';
import { RedisKeys } from '../config/redisKeys';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { CourseStatus } from '../courses/courses.model';

@Injectable()
export class SitemapsService {
  constructor(
    @InjectModel('colleges') private readonly collegeModel,
    @InjectModel('courses') private readonly courseModel,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  async getCollegesForSiteMap() {
    const redisConnected = await this.redisCacheService.checkClient();
    const cachedData = redisConnected ? await this.redisCacheService.get(RedisKeys.sitemapColleges) : null;

    if (!cachedData) {
      const colleges = await this.collegeModel.find({isSuspended: {$ne: true}, invitation: { $ne: 'pending' }}, 'title numId').sort({title: 1}).lean().exec();

      if (redisConnected) {
        await this.redisCacheService.set(RedisKeys.sitemapColleges, colleges, 43200);
      }
      return ResponseHandler.success(colleges);

    } else {
      return ResponseHandler.success(cachedData);
    }
  }

  async getCoursesForSiteMap() {
    const redisConnected = await this.redisCacheService.checkClient();
    const cachedData = redisConnected ? await this.redisCacheService.get(RedisKeys.sitemapCourses) : null;

    if (!cachedData) {

      const suspendedColleges = await this.collegeModel.find({isSuspended: true}, '_id').lean().exec();
      const suspendedCollegeIds = suspendedColleges.map(college => college._id);

      const courses = await this.courseModel.find({enrollmentDeadline: { $gte: new Date() }, unpublishedDate: null, status: { $ne: CourseStatus.COMING_SOON }}, 'title numId').sort({enrollmentDeadline: 1}).lean().exec();

      if (redisConnected) {
        await this.redisCacheService.set(RedisKeys.sitemapCourses, courses, 43200);
      }
      return ResponseHandler.success(courses);

    } else {
      return ResponseHandler.success(cachedData);
    }
  }
}
