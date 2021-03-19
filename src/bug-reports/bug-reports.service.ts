import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {BugReport} from './bug-report.model';
import ResponseHandler from '../common/ResponseHandler';
import responseMessages from '../config/responseMessages';

@Injectable()
export class BugReportsService {
  constructor(@InjectModel('bug-reports') private readonly bugReportModel) {}

  async createBugReport(report: BugReport) {
    let newReport = this.bugReportModel(report);
    newReport = await newReport.save();

    return ResponseHandler.success(newReport, responseMessages.success.createBugReport);
  }

  async reviewBugReport(report) {
    const newReport = await this.bugReportModel.findByIdAndUpdate(report.bugReportId,
      {
        $set: {
          comment: report.comment,
          status: 'reviewed',
          resolvedBy: report.resolvedBy,
          resolvedAt: new Date(),
        },
      },
      {new: true},
    ).exec();

    return ResponseHandler.success(newReport, responseMessages.success.reviewBugReport);
  }

  async getBugReports(params) {
    const {keyword, page, perPage} = params;

    const reports = await this.bugReportModel.find({
      title: {
        $regex: keyword,
        $options: 'i',
      },
    })
      .populate('reportedBy', 'fullname , profilePhoto profilePhotoThumbnail')
      .populate('resolvedBy', 'fullname')
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    const rows = await this.bugReportModel.countDocuments({
      title: {
        $regex: keyword,
        $options: 'i',
      },
    }).exec();

    return ResponseHandler.success({
      reports, rows,
    });
  }

  async getReportDetails(reportId: string) {
    const report = await this.bugReportModel.findById(reportId)
      .populate('reportedBy', 'fullname , emailAddress , profilePhoto profilePhotoThumbnail')
      .populate('resolvedBy', 'fullname')
      .lean();

    return ResponseHandler.success(report);
  }

  async deleteBugReport(reportId: string) {
    const newReport = await this.bugReportModel.findByIdAndUpdate(reportId, {
      $set: {
        status: 'deleted',
      },
    }, { new: true }).lean();

    return ResponseHandler.success(newReport, responseMessages.success.deleteBugReport);
  }
}
