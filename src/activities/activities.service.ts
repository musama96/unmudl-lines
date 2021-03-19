import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler from '../common/ResponseHandler';
import * as mongoose from 'mongoose';
import { generateActivityText } from './activityText';
import { ActivityTypes } from './activity.model';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel('activities') private readonly activityModel,
    @InjectModel('useractivitycategories') private readonly userActivityModel,
    @InjectModel('transactionactivitycategories') private readonly transactionActivityModel,
    @InjectModel('users') private readonly userModel,
    @InjectModel('courses') private readonly courseModel,
  ) {}

  async getActivities(params) {
    const { type, start, end, userId, courseId, learnerId, page, perPage, collegeId } = params;
    // console.log(end);

    const match = {};

    if (type) {
      // @ts-ignore
      match.type = type;
    }

    const startDate = start ? new Date(start) : new Date(new Date().setFullYear(0));
    const endDate = end ? new Date(end) : new Date();
    // if (start || end) {
    //   // @ts-ignore
    //   match.createdAt = {
    //     // $gte: start ? new Date(start).toISOString() : new Date(new Date().setFullYear(0)).toISOString(),
    //     $lte: end ? new Date(end).toISOString() : new Date().toISOString(),
    //   };
    // }

    if (userId) {
      // @ts-ignore
      match.user = mongoose.Types.ObjectId(userId);
    }

    if (courseId) {
      // @ts-ignore
      match.course = mongoose.Types.ObjectId(courseId);
    }

    if (learnerId) {
      // @ts-ignore
      match.learner = mongoose.Types.ObjectId(learnerId);
    }

    if (collegeId && type === ActivityTypes.User) {
      const userList = await this.userModel
        .find({ collegeId }, '_id')
        .lean()
        .exec();
      if (userList.length > 0) {
        const users = userList.map(user => user._id);
        // @ts-ignore
        match.user = { $in: users };
      } else {
        // @ts-ignore
        match.user = { $in: [] };
      }
    }

    if (collegeId && type === ActivityTypes.Transaction) {
      const courseList = await this.courseModel
        .find(
          {
            collegeId,
            createdAt: { $gte: new Date(startDate) },
            enrollmentDeadline: { $lte: new Date(endDate) },
          },
          '_id',
        )
        .lean()
        .exec();
      if (courseList.length > 0) {
        const courses = courseList.map(course => course._id);
        // @ts-ignore
        match.course = { $in: courses };
      } else {
        // @ts-ignore
        match.course = { $in: [] };
      }
    }

    if (collegeId && type !== ActivityTypes.Transaction && type !== ActivityTypes.User) {
      const [userList, courseList] = await Promise.all([
        this.userModel.find({ collegeId, role: {$ne: 'system'} }, '_id').lean().exec(),
        this.courseModel.find({collegeId, createdAt: { $gte: new Date(startDate) }, enrollmentDeadline: { $lte: new Date(endDate) }}, '_id')
        .lean().exec(),
      ]);

      const courses = courseList.length > 0 ? courseList.map(course => course._id) : [];
      const users = userList.length > 0 ? userList.map(user => user._id) : [];
      // @ts-ignore
      match.$or = [{ course: { $in: courses } }, { user: { $in: users } }];
    }

    const pipeline = [];
    // console.log(match);
    pipeline.push({
      $match: match,
    });

    pipeline.push(
      ...[
        {
          $match: {
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'learners',
            localField: 'learner',
            foreignField: '_id',
            as: 'learner',
          },
        },
        { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'enrollments',
            localField: 'enrollment',
            foreignField: '_id',
            as: 'enrollment',
          },
        },
        { $unwind: { path: '$enrollment', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'promos',
            localField: 'promo',
            foreignField: '_id',
            as: 'promo',
          },
        },
        { $unwind: { path: '$promo', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'otherUser',
            foreignField: '_id',
            as: 'otherUser',
          },
        },
        { $unwind: { path: '$otherUser', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'useractivitycategories',
            localField: 'userActivity',
            foreignField: '_id',
            as: 'userActivity',
          },
        },
        { $unwind: { path: '$userActivity', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'transactionactivitycategories',
            localField: 'transactionActivity',
            foreignField: '_id',
            as: 'transactionActivity',
          },
        },
        { $unwind: { path: '$transactionActivity', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            type: 1,
            userRole: 1,
            'user.fullname': 1,
            'course.title': 1,
            'learner.fullname': 1,
            'promo.title': 1,
            'enrollment.totalPaid': 1,
            'enrollment.transactionId': 1,
            'otherUser.fullname': 1,
            'userActivity.name': 1,
            'transactionActivity.name': 1,
            'userActivity.color': 1,
            'transactionActivity.color': 1,
            createdAt: 1,
          },
        },
      ],
    );
    // console.log(pipeline);
    let activities = await this.activityModel
      .aggregate(pipeline)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
    // console.log(activities);
    activities = activities.filter(activity =>
      activity.userActivity ? activity.userActivity.name : activity.transactionActivity ? activity.transactionActivity.name : '',
    );
    activities.forEach(activity => {
      activity.text = generateActivityText(activity);
      // console.log(generateActivityText(activity));
    });
    return ResponseHandler.success(activities);
  }

  async getTransactionActivitiesCsv(params) {
    const { start, end, collegeId } = params;

    const match = {
      type: 'transaction',
    };

    const startDate = start ? new Date(start) : new Date(new Date().setFullYear(0));
    const endDate = end ? new Date(end) : new Date();

    const courseList = await this.courseModel
      .find(
        {
          collegeId,
          createdAt: { $gte: new Date(startDate) },
          enrollmentDeadline: { $lte: new Date(endDate) },
        },
        '_id',
      )
      .lean()
      .exec();
    if (courseList.length > 0) {
      const courses = courseList.map(course => course._id);
      // @ts-ignore
      match.course = { $in: courses };
    } else {
      // @ts-ignore
      match.course = { $in: [] };
    }

    const pipeline = [];
    // console.log(match);
    pipeline.push({
      $match: match,
    });

    pipeline.push(
      ...[
        {
          $match: {
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'learners',
            localField: 'learner',
            foreignField: '_id',
            as: 'learner',
          },
        },
        { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'enrollments',
            localField: 'enrollment',
            foreignField: '_id',
            as: 'enrollment',
          },
        },
        { $unwind: { path: '$enrollment', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'promos',
            localField: 'promo',
            foreignField: '_id',
            as: 'promo',
          },
        },
        { $unwind: { path: '$promo', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'otherUser',
            foreignField: '_id',
            as: 'otherUser',
          },
        },
        { $unwind: { path: '$otherUser', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'useractivitycategories',
            localField: 'userActivity',
            foreignField: '_id',
            as: 'userActivity',
          },
        },
        { $unwind: { path: '$userActivity', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'transactionactivitycategories',
            localField: 'transactionActivity',
            foreignField: '_id',
            as: 'transactionActivity',
          },
        },
        { $unwind: { path: '$transactionActivity', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            type: 1,
            userRole: 1,
            'user.fullname': 1,
            'course.title': 1,
            'learner.fullname': 1,
            'promo.title': 1,
            enrollment: 1,
            'otherUser.fullname': 1,
            'userActivity.name': 1,
            'transactionActivity.name': 1,
            createdAt: 1,
          },
        },
      ],
    );

    let activities = await this.activityModel.aggregate(pipeline).exec();
    // console.log(activities);
    activities = activities.filter(activity => (activity.transactionActivity ? activity.transactionActivity.name : ''));
    return ResponseHandler.success(activities);
  }

  async createActivities(activities) {
    return await this.activityModel.insertMany(activities);
  }

  async getUserActivityId(name: string) {
    // console.log(name);
    const res = await this.userActivityModel.findOne({ name }).lean();
    // console.log(res);
    return res._id;
  }

  async getTransactionActivityId(name: string) {
    const res = await this.transactionActivityModel.findOne({ name }).lean();
    return res._id;
  }
}
