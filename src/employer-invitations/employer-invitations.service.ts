import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EMPLOYER_INVITATION_URL } from '../config/config';
import { EmployerInvitationDto } from './employer-invitation.dto';
import { MailerService } from '@nest-modules/mailer';
import * as mongoose from 'mongoose';
import CommonFunctions from '../common/functions';
import ResponseHandler from '../common/ResponseHandler';
import { PaginationDto } from '../common/dto/pagination.dto';
import json2csv = require('json2csv');
import { EmailLogsService } from '../email-logs/email-logs.service';
import { Portal } from '../email-logs/email-logs.model';
import { EmployerSubscriptionsService } from '../employer-subscriptions/employer-subscriptions.service';
import { StripeService } from '../stripe/stripe.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class EmployerInvitationsService {
  constructor(
    @InjectModel('employer-invitations') private readonly employerInvitationModel,
    @InjectModel('id-counters') private readonly counterModel,
    @InjectModel('employer-companies') private readonly employerCompanyModel,
    @InjectModel('employer-admin-tokens') private readonly employerAdminTokenModel,
    @InjectModel('employer-admins') private readonly employerAdminModel,
    @InjectModel('employer-company-tokens') private readonly employerCompanyTokenModel,
    private readonly mailerService: MailerService,
    private readonly emailLogsService: EmailLogsService,
    private readonly employerSubscriptionsService: EmployerSubscriptionsService,
    private readonly stripeService: StripeService,
    private readonly chatService: ChatService,
  ) {}

  async createInvitation(invitationData: EmployerInvitationDto) {
    try {
      const counter = await this.counterModel
        .findOneAndUpdate({}, { $inc: { employer: 1, employerAdmin: 1 } }, { new: true, upsert: true })
        .lean();
      const customerId = await this.stripeService.createCustomer({
        emailAddress: invitationData.emailAddress,
        fullname: invitationData.fullname,
      });
      const employer = await this.employerCompanyModel.create({
        numId: counter.employer,
        title: invitationData.title,
        employerGroup: invitationData.group,
        isDomainSignup: invitationData.domainSignup,
        stripeCustomerId: customerId,
      });

      // console.log(employer);
      const token = await CommonFunctions.getHash(employer._id.toString());
      const invitationToken = await this.employerCompanyTokenModel.create({
        employer: employer._id,
        token: encodeURIComponent(token),
      });
      invitationData.employerId = employer._id;

      const invitation = this.employerInvitationModel.create(invitationData);

      // const userCounter = await this.counterModel.findOneAndUpdate({}, { $inc: { user: 1 } }, { new: true, upsert: true }).lean();
      const admin = await this.employerAdminModel.create({
        emailAddress: invitationData.emailAddress,
        fullname: invitationData.fullname,
        employerId: employer._id,
        role: 'superadmin',
        invitation: 'pending',
        numId: counter.user,
      });

      // await this.chatService.initializeContactUnmudlChats(admin);

      const { data: employerSubscriptionPlan } = await this.employerSubscriptionsService.getEmployerSubscriptionPlanByLevel(0);

      await this.employerSubscriptionsService.updateEmployerSubscription({
        plan: employerSubscriptionPlan._id,
        priceStripeId: null,
        employer: employer._id,
        stripeCustomerId: customerId,
      });

      const url = EMPLOYER_INVITATION_URL;
      const text = `Dear ${invitationData.fullname}, \n  Your institue ${
        invitationData.title
      } have been invited to join unmudl.\n Click the following link to signup ${url}${encodeURIComponent(token)}.`;

      const mailData = {
        to: invitationData.emailAddress,
        from: process.env.PARTNER_NOREPLY_FROM,
        subject: 'Invitation from Unmudl',
        template: 'employerInvitation',
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

  async resendInvitationEmail(invitationId: string) {
    try {
      const invitationData = await this.employerInvitationModel
        .findById(invitationId)
        .lean()
        .exec();
      const token = await CommonFunctions.getHash(invitationData.employerId.toString());
      const invitationToken = await this.employerCompanyTokenModel.create({
        employer: invitationData.employerId,
        token: encodeURIComponent(token),
      });
      const url = EMPLOYER_INVITATION_URL;

      const mailData = {
        to: invitationData.emailAddress,
        from: process.env.PARTNER_NOREPLY_FROM,
        subject: 'Invitation from Unmudl',
        template: 'employerInvitation',
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

      return ResponseHandler.success({}, 'Email sent successfully');
    } catch (err) {
      console.log(err);
      return ResponseHandler.fail('Something went wrong', { err });
    }
  }

  async updateAcceptedInvitation(employerId: string) {
    const employer = mongoose.Types.ObjectId(employerId);
    return await this.employerInvitationModel.findOneAndUpdate(
      { employerId: employer },
      { status: 'accepted', date_accepted: new Date() },
      { new: true },
    );
  }

  async toggleSuspend(invitationId: string) {
    const invitation = await this.employerInvitationModel.findById(invitationId);
    invitation.isSuspended = invitation && invitation.status !== 'accepted' ? !invitation.isSuspended : invitation.isSuspended;
    await invitation.save();

    return ResponseHandler.success(invitation);
  }

  async checkExistingInvitationByEmployerName(collegeName: string) {
    return await this.employerInvitationModel
      .findOne({ title: collegeName })
      .lean()
      .exec();
  }

  async getEmployerInvitations(params: PaginationDto) {
    const { page, perPage, keyword, sortOrder, sortBy } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const [partners, rows] = await Promise.all([
      this.employerInvitationModel
        .find()
        .byTitle(keyword)
        .collation({ locale: 'en', strength: 2 })
        .sort(sort)
        .paginate(page, perPage)
        .populate('employerId', 'employerLogo employerLogoThumbnail')
        .lean()
        .exec(),
      this.employerInvitationModel.countDocuments({ title: { $regex: keyword, $options: 'i' } }),
    ]);

    return ResponseHandler.success({ partners, rows });
  }

  async getEmployerInvitationsCsv(params: PaginationDto) {
    const { keyword, sortOrder, sortBy } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const partners = await this.employerInvitationModel
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
          $sort: sort,
        },
        {
          $project: {
            'Employer Name': '$title',
            'Employer Email': '$emailAddress',
            'Date Invited': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
            // 'Commission Percentage': { $concat: [{ $toString: '$commission' }, '%'] },
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
    const fields = ['Employer Name', 'Employer Email', 'Date Invited', /*'Commission Percentage', */ 'Status', 'Date Signed Up'];
    return json2csv.parse(partners, { fields });
  }

  async deleteInvitation(invitationId: string) {
    const employerInvitaion = await this.employerInvitationModel.findById(invitationId);

    if (!employerInvitaion || employerInvitaion.status !== 'pending') {
      return ResponseHandler.fail('Can not delete accepted invitation.');
    }

    await Promise.all([
      this.employerInvitationModel.deleteOne({ _id: mongoose.Types.ObjectId(employerInvitaion._id) }),
      this.employerAdminModel.deleteOne({ emailAddress: employerInvitaion.emailAddress }),
    ]);

    return ResponseHandler.success({}, 'Successfully deleted.');
  }
}
