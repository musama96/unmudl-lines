import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler from '../common/ResponseHandler';
import { ReportLearnerDto } from '../learners/dto/reportLearner.dto.';
import { AddLearnerReportDto } from './dto/addLearnerReport.dto';
import * as mongoose from 'mongoose';
import { ReportLearnerStatus } from './reported-learner.model';
import { UpdateReportStatusDto } from '../posts/dto/updateReportStatus.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UpdateLearnerReportDto } from './dto/updateReport.dto';

@Injectable()
export class ReportedLearnersService {
  constructor(
    @InjectModel('reported-learners') private readonly reportedLearnerModel,
    @InjectModel('learners') private readonly learnerModel,
  ) {}

  async addReport(reportDetails: AddLearnerReportDto) {
    const { learnerId, collegeId, userId, reason } = reportDetails;
    const [reportResolved, alreadyReported] = await Promise.all([
      this.reportedLearnerModel
        .findOne(
          {
            learner: mongoose.Types.ObjectId(learnerId),
            status: { $in: [ReportLearnerStatus.IGNORED, ReportLearnerStatus.SUSPENDED] },
          },
          '_id',
        )
        .lean()
        .exec(),
      this.reportedLearnerModel
        .findOne(
          {
            learner: mongoose.Types.ObjectId(learnerId),
            'report.user': mongoose.Types.ObjectId(userId),
          },
          '_id',
        )
        .lean()
        .exec(),
    ]);
    if (reportResolved || alreadyReported) {
      return ResponseHandler.fail(reportResolved ? 'This learners report is already resolved.' : 'You have alraedy reported this learner');
    }

    const report = await this.reportedLearnerModel
      .findOneAndUpdate(
        { learner: mongoose.Types.ObjectId(learnerId) },
        { $addToSet: { report: { user: userId, reason }, colleges: collegeId }, status: ReportLearnerStatus.PENDING },
        { upsert: true, new: true },
      )
      .exec();

    return report ? ResponseHandler.success(report) : ResponseHandler.fail('Already reported.');
  }

  async updateReport(params: UpdateLearnerReportDto) {
    const { reportId, status } = params;

    const report = await this.reportedLearnerModel.findByIdAndUpdate(reportId, { status }, { new: true });
    if (report.status === ReportLearnerStatus.SUSPENDED) {
      await this.learnerModel.findByIdAndUpdate(report.learner, { isSuspended: true }, { new: true });
    }
    return ResponseHandler.success(
      report,
      'Report updated successfully' + report.status === ReportLearnerStatus.SUSPENDED ? ' and the learner is suspended.' : '.',
    );
  }

  async getReports(params: PaginationDto) {
    const { page, perPage } = params;

    const [reports, rows] = await Promise.all([
      this.reportedLearnerModel
        .find()
        .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
        .populate('colleges', 'title collegeLogo collegeLogoThumbnail')
        .populate('report.user', 'fullname profilePhoto profilePhotoThumbnail')
        .paginate(page, perPage)
        .lean()
        .exec(),
      this.reportedLearnerModel.countDocuments().exec(),
    ]);

    return ResponseHandler.success({ reports, rows });
  }
}
