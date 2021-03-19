import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RefundRequest } from './refund-request.model';
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import { RefundStatus } from '../common/enums/createRefund.enum';
import responseMessages from '../config/responseMessages';
import { NotificationsService } from '../notifications/notifications.service';
import * as mongoose from 'mongoose';
import { MailerService } from '@nest-modules/mailer';
import EmailHtmls from '../common/emailHtml';
import { RefundRequestListDto } from './dto/refundRequestList.dto';
import moment = require('moment');
import { EmailLogsService } from '../email-logs/email-logs.service';
import { Portal } from '../email-logs/email-logs.model';

@Injectable()
export class RefundRequestsService {
  constructor(
    @InjectModel('refund-requests') private readonly refundRequestModel,
    @InjectModel('users') private readonly userModel,
    @InjectModel('learners') private readonly learnerModel,
    @InjectModel('courses') private readonly courseModel,
    private readonly notificationsService: NotificationsService,
    private readonly mailerService: MailerService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  async getRefundRequestDetails(requestId) {
    const details = await this.refundRequestModel
      .aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(requestId),
          },
        },
        {
          $lookup: {
            from: 'learners',
            localField: 'requestedBy',
            foreignField: '_id',
            as: 'learner',
          },
        },
        {
          $lookup: {
            from: 'courses',
            // localField: 'courseId',
            // foreignField: '_id',
            let: { courseId: '$courseId' },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$_id', '$$courseId'] }] } } },
              {
                $lookup: {
                  from: 'colleges',
                  localField: 'collegeId',
                  foreignField: '_id',
                  as: 'college',
                },
              },
              { $unwind: '$college' },
            ],
            as: 'course',
          },
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: 'requestedBy',
            foreignField: 'learnerId',
            as: 'enrollments',
          },
        },
        {
          $project: {
            learnerName: { $arrayElemAt: ['$learner.fullname', 0] },
            dateJoined: { $arrayElemAt: ['$learner.createdAt', 0] },
            courseName: { $arrayElemAt: ['$course.title', 0] },
            collegeName: { $arrayElemAt: ['$course.college.title', 0] },
            price: { $arrayElemAt: ['$course.price', 0] },
            validEnrollments: {
              $filter: {
                input: '$enrollments',
                as: 'enrollment',
                cond: {
                  $or: [
                    { $eq: ['$$enrollment.status', 'pending'] },
                    { $eq: ['$$enrollment.status', 'approved'] },
                    { $eq: ['$$enrollment.status', 'processed'] },
                    { $eq: ['$$enrollment.status', 'transferred'] },
                  ],
                },
              },
            },
            enrollmentDeadline: { $arrayElemAt: ['$course.enrollmentDeadline', 0] },
            dateOfRequest: '$createdAt',
            reason: 1,
            otherInfo: 1,
            status: 1,
          },
        },
        {
          $addFields: {
            totalAmountSpent: {
              $sum: '$validEnrollments.totalPaid',
            },
            totalCoursesBought: {
              $size: '$validEnrollments',
            },
          },
        },
      ])
      .exec();

    return ResponseHandler.success(details.length > 0 ? details[0] : null);
  }

  async getRefundRequestByEnrollment(enrollmentId) {
    const request = await this.refundRequestModel.findOne({ enrollmentId }).lean();

    return ResponseHandler.success(request);
  }

  async getRefundRequests(params: RefundRequestListDto) {
    const { page, perPage, sortBy, sortOrder, collegeId } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const pipeline = [];

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'learners',
            localField: 'requestedBy',
            foreignField: '_id',
            as: 'learner',
          },
        },
        { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      ],
    );

    if (collegeId) {
      pipeline.push({
        $match: {
          'course.collegeId': mongoose.Types.ObjectId(collegeId),
        },
      });
    }

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'colleges',
            localField: 'course.collegeId',
            foreignField: '_id',
            as: 'college',
          },
        },
        { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
        // {
        //   $lookup: {
        //     from: 'enrollments',
        //     localField: 'enrollmentId',
        //     foreignField: '_id',
        //     as: 'enrollment',
        //   },
        // },
        // { $unwind: {path: '$enrollment', preserveNullAndEmptyArrays: true} },
        {
          $project: {
            learnerName: '$learner.fullname',
            learnerProfilePhoto: '$learner.profilePhoto',
            learnerProfilePhotoThumbnail: '$learner.profilePhotoThumbnail',
            courseName: '$course.title',
            collegeName: '$college.title',
            // price: { $add: ['$course.price', { $multiply: ['$course.price', { $divide: ['$college.salesTax', 100] }] }] },
            price: { $add: ['$course.price', { $multiply: ['$course.price', { $divide: ['$college.unmudlShare', 100] }] }] },
            priceWithTax: { $add: ['$price', { $multiply: ['$price', { $divide: ['$college.salesTax', 100] }] }] },
            // pricePaid: '$enrollment',
            enrollmentDeadline: '$course.enrollmentDeadline',
            requestDate: '$createdAt',
            dateResolved: 1,
            status: 1,
          },
        },
        {
          $sort: sort,
        },
      ],
    );

    const [requests, { data: rows }] = await Promise.all([
      this.refundRequestModel
        .aggregate(pipeline)
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.getRefundRequestsRows(params),
    ]);

    return ResponseHandler.success({
      requests,
      rows,
    });
  }

  async getRefundRequestsRows(params) {
    const { collegeId } = params;

    const pipeline = [];

    pipeline.push(
      ...[
        {
          $lookup: {
            from: 'learners',
            localField: 'requestedBy',
            foreignField: '_id',
            as: 'learner',
          },
        },
        { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      ],
    );

    if (collegeId) {
      pipeline.push({
        $match: {
          'course.collegeId': mongoose.Types.ObjectId(collegeId),
        },
      });
    }

    pipeline.push(
      ...[
        {
          $group: {
            _id: null,
            rows: { $sum: 1 },
          },
        },
      ],
    );

    const rows = await this.refundRequestModel.aggregate(pipeline).exec();

    return ResponseHandler.success(rows.length > 0 ? rows[0].rows : 0);
  }

  async createRefundRequest(request: RefundRequest): Promise<SuccessInterface> {
    let newRequest = new this.refundRequestModel(request);
    newRequest = await newRequest.save();

    this.notificationsService.refundRequest(newRequest);

    await this.sendCollegeMail(request);
    // return newRequest;
    return ResponseHandler.success(newRequest, responseMessages.success.createRefundRequest);
  }

  async sendCollegeMail(request: RefundRequest) {
    const [learner, course] = await Promise.all([
      this.learnerModel
        .findById(request.requestedBy, 'fullname')
        .lean()
        .exec(),
      this.courseModel.findById(request.courseId, 'collegeId title').populate('collegeId', 'title'),
    ]);
    const collegeAdmin = await this.userModel
      .find(
        {
          collegeId: mongoose.Types.ObjectId(course.collegeId._id),
          role: { $in: ['superadmin', 'admin'] },
          'notifications.email': { $ne: false },
        },
        'fullname emailAddress',
      )
      .lean()
      .exec();
    // console.log(collegeAdmin);
    if (collegeAdmin && collegeAdmin.length > 0) {
      // console.log(collegeAdmin);
      for (let i = 0; i < collegeAdmin.length; i++) {
        setTimeout(async () => {
          const mailData = {
            to: collegeAdmin[i].emailAddress,
            from: process.env.PARTNER_NOTIFICATION_FROM,
            subject: 'Unmudl learner is requesting refund',
            template: 'collegeMailOnRefundRequest',
            context: {
              unmudlLogo: process.env.UNMUDL_LOGO_PATH,
              date: moment(new Date()).format('LL'),
              learner,
              course,
              college: course.collegeId,
              collegeLoginLink: process.env.COLLEGE_LOGIN_LINK,
              refundMail: process.env.REFUND_MAIL,
            },
          };
          const mail = await this.mailerService.sendMail(mailData);

          mail ? this.emailLogsService.createEmailLog(mailData, Portal.ADMIN) : null;
        }, 1000);
      }
    }
  }

  async rejectRefundRequest(requestId) {
    const request = await this.refundRequestModel
      .findByIdAndUpdate(
        requestId,
        {
          $set: {
            status: RefundStatus.REJECTED,
          },
        },
        { new: true },
      )
      .lean();

    this.notificationsService.refundRequest(request);

    return ResponseHandler.success(request, responseMessages.success.rejectRefundRequest);
  }

  async getRequestDetails(requestId) {
    const request = await this.refundRequestModel
      .findById(requestId)
      .populate('enrollmentId', '+payableToUnmudl')
      .populate('requestedBy')
      .populate({
        path: 'courseId',
        populate: {
          path: 'collegeId',
        },
      })
      .lean();

    return ResponseHandler.success(request);
  }

  async setRefundRequestStatus(requestId, status) {
    const request = await this.refundRequestModel
      .findByIdAndUpdate(
        requestId,
        {
          $set: {
            status,
          },
        },
        { new: true },
      )
      .lean();

    return ResponseHandler.success(request);
  }

  async approveRefundRequest(requestId, stripeData) {
    const request = await this.refundRequestModel
      .findByIdAndUpdate(
        requestId,
        {
          $set: {
            status: 'refunded',
            refundId: stripeData.id,
            refundAmount: stripeData ? stripeData.amount / 100 : 0, // converting from cents to dollars
            dateResolved: new Date(),
          },
        },
        { new: true },
      )
      .populate('enrollmentId')
      .lean();

    this.notificationsService.refundRequest(request);
    return ResponseHandler.success(request);
  }
}
