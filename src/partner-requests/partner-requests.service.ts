import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler from '../common/ResponseHandler';
import responseMessages from '../config/responseMessages';
import * as mongoose from 'mongoose';
import { PartnerRequestListDto } from './dto/partnerRequestList.dto';
import json2csv = require('json2csv');
import { UserRoles } from '../users/user.model';
import moment = require('moment');
import { MailerService } from '@nest-modules/mailer';
import { Portal } from '../email-logs/email-logs.model';
import { EmailLogsService } from '../email-logs/email-logs.service';

@Injectable()
export class PartnerRequestsService {
  constructor(
    @InjectModel('partner-requests') private readonly partnerRequestModel,
    @InjectModel('users') private readonly userModel,
    private readonly mailerService: MailerService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  async checkPartnerRequest(collegeName) {
    const request = await this.partnerRequestModel
      .findOne({ collegeName, status: 'pending' })
      .lean()
      .exec();
    return !!request;
  }

  async createPartnerRequest(collegeRequest) {
    let newCollegeRequest = new this.partnerRequestModel(collegeRequest);
    newCollegeRequest = await newCollegeRequest.save();

    const mailData = {
      to: process.env.PARTNER_WITH_UNMUDL_MAIL,
      from: process.env.ADMIN_NOTIFICATION_FROM,
      subject: 'Unmudl Notification',
      template: 'partnerRequestMail',
      context: {
        unmudlLogo: process.env.UNMUDL_LOGO_PATH,
        date: moment(new Date()).format('LL'),
        partnerRequest: collegeRequest,
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
            template: 'partnerRequestMail',
            context: {
              unmudlLogo: process.env.UNMUDL_LOGO_PATH,
              date: moment(new Date()).format('LL'),
              partnerRequest: collegeRequest,
            },
          };
          const mail = await this.mailerService.sendMail(mailData);

          mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;
        }, 1000);
      }
    }

    return ResponseHandler.success(newCollegeRequest);
  }

  async getPartnerRequests(params: PartnerRequestListDto) {
    const { page, perPage, sortBy, sortOrder, keyword } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const [requests, rows] = await Promise.all([
      this.partnerRequestModel
        .aggregate([
          { $match: { collegeName: { $regex: keyword, $options: 'i' } } },
          { $sort: sort },
          { $skip: (page - 1) * perPage },
          { $limit: perPage },
        ])
        .collation({ locale: 'en', strength: 2 })
        .exec(),
      this.partnerRequestModel.countDocuments({ collegeName: { $regex: keyword, $options: 'i' } }),
    ]);

    return ResponseHandler.success({ requests, rows });
  }

  async getPartnerRequestsCsv(params: PartnerRequestListDto) {
    const { sortBy, sortOrder, keyword } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const requests = await this.partnerRequestModel
      .aggregate([
        { $match: { collegeName: { $regex: keyword, $options: 'i' } } },
        { $sort: sort },
        {
          $project: {
            'Name of Contact': '$contactPerson',
            'Community College': '$collegeName',
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

    const fields = ['Name of Contact', 'Community College', 'Contact Email', 'Contact Phone Number', 'Status', 'Request Date'];
    return json2csv.parse(requests, { fields });
  }

  async getPartnerRequestDetails(id) {
    const request = await this.partnerRequestModel.findById(id).lean();

    return ResponseHandler.success(request);
  }

  async updatePartnerRequestStatus({ partnerRequestId, status }) {
    const request = await this.partnerRequestModel
      .findByIdAndUpdate(
        partnerRequestId,
        {
          $set: { status },
        },
        { new: true },
      )
      .lean();

    // this.notificationsService.partnerRequest(request);
    return ResponseHandler.success(request, responseMessages.success.updatePartnerRequestStatus(status));
  }

  async deletePartnerRequest(requestId: string) {
    try {
      await this.partnerRequestModel.deleteOne({
        _id: mongoose.Types.ObjectId(requestId),
        status: { $in: ['pending', 'rejected'] },
      });
      return ResponseHandler.success('Successfully deleted.');
    } catch (err) {
      return ResponseHandler.fail('Can not delete an accepted request.');
    }
  }
}
