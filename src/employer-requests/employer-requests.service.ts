import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nest-modules/mailer';
import moment = require('moment');
import ResponseHandler from '../common/ResponseHandler';
import { UserRoles } from '../users/user.model';
import { EmployerRequestListDto } from './dto/employerRequestList.dto';
import json2csv = require('json2csv');
import responseMessages from '../config/responseMessages';
import * as mongoose from 'mongoose';
import { EmailLogsService } from '../email-logs/email-logs.service';
import { Portal } from '../email-logs/email-logs.model';

@Injectable()
export class EmployerRequestsService {
  constructor(
    @InjectModel('employer-requests') private readonly employerRequestModel,
    @InjectModel('users') private readonly userModel,
    private readonly mailerService: MailerService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  async checkEmployerRequest(collegeName) {
    const request = await this.employerRequestModel
      .findOne({ collegeName, status: 'pending' })
      .lean()
      .exec();
    return !!request;
  }

  async createEmployerRequest(employerRequest) {
    let newEmployerRequest = new this.employerRequestModel(employerRequest);
    newEmployerRequest = await newEmployerRequest.save();

    const mailData = {
      to: process.env.PARTNER_WITH_UNMUDL_MAIL,
      from: process.env.ADMIN_NOTIFICATION_FROM,
      subject: 'Unmudl Notification',
      template: 'employerRequestMail',
      context: {
        unmudlLogo: process.env.UNMUDL_LOGO_PATH,
        date: moment(new Date()).format('LL'),
        employerRequest,
      },
    };
    const mail = await this.mailerService.sendMail(mailData);

    mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;

    const unmudlSuperAdmin = await this.userModel.find({collegeId: null, role: UserRoles.SUPERADMIN, 'notifications.email': true}, 'emailAddress')
    .lean().exec();

    if (unmudlSuperAdmin && unmudlSuperAdmin.length > 0) {
      for (let i = 0; i < unmudlSuperAdmin.length; i++) {
        setTimeout(async () => {
          const mailData = {
            to: unmudlSuperAdmin[i].emailAddress,
            from: process.env.ADMIN_NOTIFICATION_FROM,
            subject: 'UNMUDL Notification',
            template: 'employerRequestMail',
            context: {
              unmudlLogo: process.env.UNMUDL_LOGO_PATH,
              date: moment(new Date()).format('LL'),
              employerRequest,
            },
          };
          const mail = await this.mailerService.sendMail(mailData);

          mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;
        }, 1000);
      }
    }

    return ResponseHandler.success(newEmployerRequest);
  }

  async getEmployerRequests(params: EmployerRequestListDto) {
    const { page, perPage, sortBy, sortOrder, keyword } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const [requests, rows] = await Promise.all([
      this.employerRequestModel
        .aggregate([
          { $match: { employerName: { $regex: keyword, $options: 'i' } } },
          { $sort: sort },
          { $skip: (page - 1) * perPage },
          { $limit: perPage },
        ])
        .collation({ locale: 'en', strength: 2 })
        .exec(),
      this.employerRequestModel.countDocuments({ employerName: { $regex: keyword, $options: 'i' } }),
    ]);

    return ResponseHandler.success({ requests, rows });
  }

  async getEmployerRequestsCsv(params: EmployerRequestListDto) {
    const { sortBy, sortOrder, keyword } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const requests = await this.employerRequestModel
      .aggregate([
        { $match: { employerName: { $regex: keyword, $options: 'i' } } },
        { $sort: sort },
        {
          $project: {
            'Name of Contact': '$contactPerson',
            'Employer Name': '$employerName',
            'Contact Email': '$email',
            'Contact Phone Number': { $concat: ['"', '$phoneNumber', '"'] },
            Status: {
              $concat: [
                { $toUpper: { $substrCP: ['$status', 0, 1] } },
                { $substrCP: ['$status', 1, { $subtract: [{ $strLenCP: '$status' }, 1] }] },
              ],
            },
            'Request Date': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
          },
        },
      ])
      .collation({ locale: 'en', strength: 2 })
      .exec();

    const fields = ['Name of Contact', 'Employer Name', 'Contact Email', 'Contact Phone Number', 'Status', 'Request Date'];
    return json2csv.parse(requests, { fields });
  }

  async getEmployerRequestDetails(id) {
    const request = await this.employerRequestModel.findById(id).lean();

    return ResponseHandler.success(request);
  }

  async updateEmployerRequestStatus({ employerRequestId, status }) {
    const request = await this.employerRequestModel
      .findByIdAndUpdate(
        employerRequestId,
        {
          $set: { status },
        },
        { new: true },
      )
      .lean();

    // this.notificationsService.partnerRequest(request);
    return ResponseHandler.success(request, responseMessages.success.updatePartnerRequestStatus(status));
  }

  async deleteEmployerRequest(requestId: string) {
    try {
      await this.employerRequestModel.deleteOne({
        _id: mongoose.Types.ObjectId(requestId),
        status: { $in: ['pending', 'rejected'] },
      });
      return ResponseHandler.success('Successfully deleted.');
    } catch (err) {
      return ResponseHandler.fail('Can not delete an accepted request.');
    }
  }
}
