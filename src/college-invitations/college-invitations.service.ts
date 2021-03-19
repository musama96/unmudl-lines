import { Injectable } from '@nestjs/common';
import { MailerService } from '@nest-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import CommonFunctions from '../common/functions';
import { COLLEGE_INVITATION_URL } from '../config/config';
import ResponseHandler from '../common/ResponseHandler';
import * as mongoose from 'mongoose';
import { CollegeInvitationDto } from './dto/college-invitation.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import json2csv = require('json2csv');
import { Portal } from '../email-logs/email-logs.model';
import { EmailLogsService } from '../email-logs/email-logs.service';

@Injectable()
export class CollegeInvitationsService {
  constructor(
    @InjectModel('colleges') private readonly collegeModel,
    @InjectModel('collegetokens') private readonly collegeTokenModel,
    @InjectModel('college-invitations') private readonly collegeInvitaionsModel,
    @InjectModel('id-counters') private readonly counterModel,
    @InjectModel('users') private readonly userModel,
    private readonly mailerService: MailerService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  async checkExistingInvitationByCollegeName(collegeName: string) {
    return await this.collegeInvitaionsModel
      .findOne({ title: collegeName })
      .lean()
      .exec();
  }

  async getCollegeInvitations(params: PaginationDto) {
    const { page, perPage, keyword, sortOrder, sortBy } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const [partners, rows] = await Promise.all([
      this.collegeInvitaionsModel
        .find()
        .byTitle(keyword)
        .collation({ locale: 'en', strength: 2 })
        .sort(sort)
        .paginate(page, perPage)
        .populate('collegeId', 'collegeLogo collegeLogoThumbnail')
        .lean()
        .exec(),
      this.collegeInvitaionsModel.countDocuments({ title: { $regex: keyword, $options: 'i' } }),
    ]);

    return ResponseHandler.success({ partners, rows });
  }

  async getCollegeInvitationsCsv(params: PaginationDto) {
    const { keyword, sortOrder, sortBy } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const partners = await this.collegeInvitaionsModel
      .aggregate([
        {
          $match: {
            title: {
              $regex: keyword,
              $options: 'i',
            },
          },
        },
        {
          $lookup: {
            from: 'colleges',
            localField: 'collegeId',
            foreignField: 'colleges',
            as: 'college',
          },
        },
        {
          $sort: sort,
        },
        {
          $project: {
            'Partner Name': '$title',
            'Partner Email': '$emailAddress',
            'Date Invited': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
            'Commission Percentage': { $concat: [{ $toString: '$commission' }, '%'] },
            Status: {
              $concat: [
                { $toUpper: { $substrCP: ['$status', 0, 1] } },
                { $substrCP: ['$status', 1, { $subtract: [{ $strLenCP: '$status' }, 1] }] },
              ],
            },
            'Date Signed Up': { $dateToString: { date: '$date_accepted', format: '%Y-%m-%d' } },
          },
        },
      ])
      .collation({ locale: 'en', strength: 2 })
      .exec();
    const fields = ['Partner Name', 'Partner Email', 'Date Invited', 'Commission Percentage', 'Status', 'Date Signed Up'];
    return json2csv.parse(partners, { fields });
  }

  async createInvitation(invitationData: CollegeInvitationDto) {
    try {
      const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { college: 1, user: 1 } }, { new: true, upsert: true }).lean();
      const college = await this.collegeModel.create({
        numId: counter.college,
        title: invitationData.title,
        unmudlShare: invitationData.commission,
        contact: {
          email: invitationData.emailAddress,
          name: invitationData.fullname,
        },
        partnerGroup: invitationData.group,
        domain: invitationData.domainSignup
          ? invitationData.emailAddress.substring(invitationData.emailAddress.lastIndexOf('@') + 1)
          : null,
      });

      const token = await CommonFunctions.getHash(college._id.toString());
      const invitationToken = await this.collegeTokenModel.create({
        college: college._id,
        token: encodeURIComponent(token),
      });
      invitationData.collegeId = college._id;

      const invitation = this.collegeInvitaionsModel.create(invitationData);

      // const userCounter = await this.counterModel.findOneAndUpdate({}, { $inc: { user: 1 } }, { new: true, upsert: true }).lean();
      const user = await this.userModel.create({
        emailAddress: invitationData.emailAddress,
        fullname: invitationData.fullname,
        collegeId: college._id,
        role: 'superadmin',
        invitation: 'pending',
        numId: counter.user,
      });

      const url = COLLEGE_INVITATION_URL;
      const mailData = {
        to: invitationData.emailAddress,
        from: process.env.PARTNER_NOREPLY_FROM,
        subject: 'Invitation from Unmudl',
        template: 'collegeInvitation',
        context: {
          unmudlLogo: process.env.UNMUDL_LOGO_PATH,
          siteName: process.env.SITE_NAME,
          invitationData,
          url,
          token: encodeURIComponent(token),
        },
      };
      const mail = await this.mailerService.sendMail(mailData);

      mail ? this.emailLogsService.createEmailLog(mailData, Portal.ADMIN) : null;

      return ResponseHandler.success(invitation);
    } catch (err) {
      return ResponseHandler.fail('something went wrong', err);
    }
  }

  async updateAcceptedInvitation(collegeId: string) {
    const college = mongoose.Types.ObjectId(collegeId);
    return await this.collegeInvitaionsModel.findOneAndUpdate(
      { collegeId: college },
      { status: 'accepted', date_accepted: new Date() },
      { new: true },
    );
  }

  async resendInvitationEmail(invitationId: string) {
    try {
      const invitationData = await this.collegeInvitaionsModel
        .findById(invitationId)
        .lean()
        .exec();
      const token = await CommonFunctions.getHash(invitationData.collegeId.toString());
      const invitationToken = await this.collegeTokenModel.create({
        college: invitationData.collegeId,
        token: encodeURIComponent(token),
      });
      const url = COLLEGE_INVITATION_URL;

      const mailData = {
        to: invitationData.emailAddress,
        from: process.env.PARTNER_NOREPLY_FROM,
        subject: 'Invitation from Unmudl',
        template: 'collegeInvitation',
        context: {
          unmudlLogo: process.env.UNMUDL_LOGO_PATH,
          siteName: process.env.SITE_NAME,
          invitationData,
          url,
          token: encodeURIComponent(token),
        },
      }
      const mail = await this.mailerService.sendMail(mailData);

      mail ? this.emailLogsService.createEmailLog(mailData, Portal.ADMIN) : null;

      return ResponseHandler.success({}, 'Email sent successfully');
    } catch (err) {
      console.log(err);
      return ResponseHandler.fail('Something went wrong', { err });
    }
  }

  async toggleSuspend(invitationId: string) {
    const invitation = await this.collegeInvitaionsModel.findById(invitationId);
    invitation.isSuspended = invitation && invitation.status !== 'accepted' ? !invitation.isSuspended : invitation.isSuspended;
    await invitation.save();

    return ResponseHandler.success(invitation);
  }

  async deleteInvitation(invitationId: string) {
    const collegeInvitaion = await this.collegeInvitaionsModel.findById(invitationId);

    if (!collegeInvitaion || collegeInvitaion.status !== 'pending') {
      return ResponseHandler.fail('Can not delete accepted invitation.');
    }

    await Promise.all([
      this.collegeInvitaionsModel.deleteOne({ _id: mongoose.Types.ObjectId(collegeInvitaion._id) }),
      this.userModel.deleteOne({ emailAddress: collegeInvitaion.emailAddress }),
    ]);

    return ResponseHandler.success({}, 'Successfully deleted.');
  }

}
