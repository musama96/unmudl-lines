import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Employer } from './employer.model';
import { CourseStatus } from '../courses/courses.model';
import * as mongoose from 'mongoose';

@Injectable()
export class EmployersService {
  constructor(
    @InjectModel('employers') private readonly employerModel,
  ) {}

  async createEmployers(employersArr: Employer[]) {
    const employers = await this.employerModel.create(employersArr);
    // console.log(employers);
    return employers;
  }

  async getEmployers(keyword: string) {
    return await this.employerModel.find().sort({title: 1}).byKeyword(keyword).lean();
  }

  async getEmployersForFilter(params) {
    const {keyword, collegeId} = params;
    const collegeMatch = collegeId ? {'college._id': mongoose.Types.ObjectId(collegeId)} : {'college.isSuspended': {$ne: true}};
    return await this.employerModel.aggregate([
      { $match: { title: { $regex: keyword, $options: 'i' } } },
      {
        $lookup: {
          from: 'courses',
          let: { employer: '$_id' },
          pipeline: [
            {$unwind: '$employers'},
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$employers', '$$employer'] },
                    { $gte: ['$enrollmentDeadline', new Date()] },
                    { $eq: ['$unpublishedDate', null] },
                    { $ne: ['$status', CourseStatus.CANCELED] },
                    { $ne: ['$status', CourseStatus.COMING_SOON] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'colleges',
                localField: 'collegeId',
                foreignField: '_id',
                as: 'college',
              },
            },
            {$unwind: '$college'},
            {$match: collegeMatch},
          ],
          as: 'courses',
        },
      },
      { $addFields: { coursesCount: { $size: '$courses' } } },
      { $match: { coursesCount: { $gt: 0 } } },
      {$unset: 'courses'},
      {$sort: {title: 1}},
    ]).collation({ locale: 'en', strength: 2 }).exec();
    // .find().sort({title: 1}).byKeyword(keyword).lean();
  }
}
