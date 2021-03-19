import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { ReportedActivity } from './reported-activity.model';
import { NotificationsService } from '../notifications/notifications.service';
import { ResolveReportedActivityStatusEnum } from './dto/resolveReportedActivity.dto';
import * as mongoose from 'mongoose';
import { ReportedActivitiesListDto } from './dto/reportedActivitiesList.dto';

@Injectable()
export class ReportedActivitiesService {
  constructor(
    @InjectModel('reported-activities') private readonly reportedActivityModel,
    private readonly notificationsService: NotificationsService,
  ) {}

  async addReport(report: ReportedActivity) {
    let newReport = await this.reportedActivityModel(report);
    newReport = await newReport.save();

    return ResponseHandler.success(newReport);
  }

  async getReportedActivities(params: ReportedActivitiesListDto) {
    const { page, perPage, sortOrder, sortBy } = params;
    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const [activities, rows] = await Promise.all([
      this.reportedActivityModel
        .aggregate([
          {
            $sort: {
              createdAt: 1,
            },
          },
          {
            $lookup: {
              from: 'learners',
              localField: 'reportedLearnerId',
              foreignField: '_id',
              as: 'reportedLearner',
            },
          },
          {
            $lookup: {
              from: 'learners',
              localField: 'reportingLearnerId',
              foreignField: '_id',
              as: 'reportingLearner',
            },
          },
          {
            $lookup: {
              from: 'colleges',
              localField: 'reportingCollegeId',
              foreignField: '_id',
              as: 'reportingCollege',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'reportingUserId',
              foreignField: '_id',
              as: 'reportingUser',
            },
          },
          {
            $project: {
              'reportedLearner.fullname': { $arrayElemAt: ['$reportedLearner.fullname', 0] },
              'reportedLearner.profilePhoto': { $arrayElemAt: ['$reportedLearner.profilePhoto', 0] },
              'reportedLearner.profilePhotoThumbnail': { $arrayElemAt: ['$reportedLearner.profilePhotoThumbnail', 0] },
              'reportingLearner.fullname': { $arrayElemAt: ['$reportingLearner.fullname', 0] },
              'reportingLearner.profilePhoto': { $arrayElemAt: ['$reportingLearner.profilePhoto', 0] },
              'reportingLearner.profilePhotoThumbnail': { $arrayElemAt: ['$reportingLearner.profilePhotoThumbnail', 0] },
              reportingCollege: { $arrayElemAt: ['$reportingCollege.title', 0] },
              'reportingUser.fullname': { $arrayElemAt: ['$reportingUser.fullname', 0] },
              'reportingUser.profilePhoto': { $arrayElemAt: ['$reportingUser.profilePhoto', 0] },
              'reportingUser.profilePhotoThumbnail': { $arrayElemAt: ['$reportingUser.profilePhotoThumbnail', 0] },
              reviewDate: 1,
              reviewId: 1,
              resolutionDate: 1,
              status: 1,
            },
          },
          {
            $group: {
              _id: '$reviewId',
              reportedLearner: { $first: '$reportedLearner' },
              reportingLearner: { $first: '$reportingLearner' },
              reportingCollege: { $first: '$reportingCollege' },
              reportingUser: { $first: '$reportingUser' },
              reviewDate: { $first: '$reviewDate' },
              resolutionDate: { $first: '$resolutionDate' },
              status: { $first: '$status' },
              noOfReports: { $sum: 1 },
              reportId: { $first: '$_id' },
            },
          },
          { $unset: '_id' },
          { $addFields: { _id: '$reportId' } },
          { $unset: 'reportId' },
          { $unwind: { path: '$reportedLearner', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$reportingLearner', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$reportingUser', preserveNullAndEmptyArrays: true } },
          {
            $sort: sort,
          },
        ])
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.reportedActivityModel.distinct('reviewId'),
    ]);
    // console.log(rows);

    return ResponseHandler.success({ activities, rows: rows.length });
  }

  async getReportedActivityDetails(id) {
    const activity = await this.reportedActivityModel
      .aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: 'learners',
            localField: 'reportedLearnerId',
            foreignField: '_id',
            as: 'reportedLearner',
          },
        },
        {
          $lookup: {
            from: 'learners',
            localField: 'reportingLearnerId',
            foreignField: '_id',
            as: 'reportingLearner',
          },
        },
        {
          $lookup: {
            from: 'colleges',
            localField: 'reportingCollegeId',
            foreignField: '_id',
            as: 'reportingCollege',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'reportingUserId',
            foreignField: '_id',
            as: 'reportingUser',
          },
        },
        {
          $lookup: {
            from: 'reported-activities',
            localField: 'reviewId',
            foreignField: 'reviewId',
            as: 'reports',
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'reviewId',
            foreignField: 'reviews._id',
            as: 'course',
          },
        },
        {
          $project: {
            'reportedLearner.fullname': { $arrayElemAt: ['$reportedLearner.fullname', 0] },
            'reportedLearner.profilePhoto': { $arrayElemAt: ['$reportedLearner.profilePhoto', 0] },
            'reportedLearner.profilePhotoThumbnail': { $arrayElemAt: ['$reportedLearner.profilePhotoThumbnail', 0] },
            'reportingLearner.fullname': { $arrayElemAt: ['$reportingLearner.fullname', 0] },
            'reportingLearner.profilePhoto': { $arrayElemAt: ['$reportingLearner.profilePhoto', 0] },
            'reportingLearner.profilePhotoThumbnail': { $arrayElemAt: ['$reportingLearner.profilePhotoThumbnail', 0] },
            reportingCollege: { $arrayElemAt: ['$reportingCollege.title', 0] },
            'reportingUser.fullname': { $arrayElemAt: ['$reportingUser.fullname', 0] },
            'reportingUser.profilePhoto': { $arrayElemAt: ['$reportingUser.profilePhoto', 0] },
            'reportingUser.profilePhotoThumbnail': { $arrayElemAt: ['$reportingUser.profilePhotoThumbnail', 0] },
            reports: { $size: '$reports' },
            reviewDate: 1,
            status: 1,
            comment: 1,
          },
        },
        { $unwind: { path: '$reportedLearner', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$reportingLearner', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$reportingUser', preserveNullAndEmptyArrays: true } },
      ])
      .exec();

    return ResponseHandler.success(activity.length > 0 ? activity[0] : null);
  }

  async updateReportStatus({ reportedActivityId, status }): Promise<SuccessInterface> {
    const report = await this.reportedActivityModel
      .findByIdAndUpdate(
        reportedActivityId,
        {
          $set: { status },
        },
        { new: true },
      )
      .exec();

    if (status === ResolveReportedActivityStatusEnum.WARNED) {
      this.notificationsService.reviewReported(report);
    }
    return report;
  }
}
