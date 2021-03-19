import { Injectable } from '@nestjs/common';
import { EMPLOYER_ADMIN_INVITATION_URL } from '../config/config';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nest-modules/mailer';
import { ListDto } from '../common/dto/list.dto';
import ResponseHandler from '../common/ResponseHandler';
import responseMessages from '../config/responseMessages';
import * as mongoose from 'mongoose';
import * as json2csv from 'json2csv';
import { EmployerCompaniesService } from '../employer-companies/employer-companies.service';
import { Portal } from '../email-logs/email-logs.model';
import { EmailLogsService } from '../email-logs/email-logs.service';

@Injectable()
export class EmployerAdminInvitationsService {
  constructor(
    @InjectModel('employer-admins') private readonly employerAdminModel,
    @InjectModel('employer-admin-invitations') private readonly employerAdminInvitationModel,
    private readonly mailerService: MailerService,
    private readonly employerCompaniesService: EmployerCompaniesService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  async getAdminInvitations(params: ListDto) {
    const { employerId, keyword, page, perPage, sortOrder, sortBy, status } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
    };

    if (employerId) {
      // @ts-ignore
      match.employerId = mongoose.Types.ObjectId(employerId);
    }

    if (status) {
      // @ts-ignore
      match.status = { $in: status };
    }

    const invitedAdmins = await this.employerAdminInvitationModel
      .aggregate([
        {
          $match: match,
        },
        { $sort: sort },
      ])
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
    const { data: rows } = await this.getAdminInvitationsRows(params);

    return ResponseHandler.success({
      invitedAdmins,
      rows,
    });
  }

  async getAdminInvitationsCsv(params: ListDto) {
    const { employerId, keyword, sortOrder, sortBy, status } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
    };

    if (employerId) {
      // @ts-ignore
      match.employerId = mongoose.Types.ObjectId(employerId);
    }

    if (status) {
      // @ts-ignore
      match.status = { $in: status };
    }

    const invitedAdmins = await this.employerAdminInvitationModel
      .aggregate([
        {
          $match: match,
        },
        {
          $project: {
            'Full Name': '$fullname',
            'Email Address': '$emailAddress',
            Role: '$role',
            Status: '$status',
          },
        },
        { $sort: sort },
      ])
      .exec();

    const fields = ['Full Name', 'Email Address', 'Role', 'Status'];
    return json2csv.parse(invitedAdmins, { fields });
  }

  async getEmployerAdminInvitationCount(employer) {
    const count = await this.employerAdminInvitationModel.countDocuments({ employerId: employer, deletedAt: null }).lean();

    return ResponseHandler.success(count);
  }

  async getAdminInvitationsRows(params: ListDto) {
    const { employerId, keyword } = params;

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
    };

    if (employerId) {
      // @ts-ignore
      match.employerId = mongoose.Types.ObjectId(employerId);
    }

    const rows = await this.employerAdminInvitationModel.countDocuments(match).exec();

    return ResponseHandler.success(rows);
  }

  async getInvitationById(id, lean = true) {
    let invitation = this.employerAdminInvitationModel.findById(id);
    if (lean) {
      invitation = await invitation.lean();
    } else {
      invitation = await invitation.exec();
    }

    return ResponseHandler.success(invitation);
  }

  async removeAdminInvitation(id) {
    const invitation = await this.employerAdminInvitationModel.findById(id).lean();

    if (invitation.status === 'pending') {
      await this.employerAdminInvitationModel.deleteOne({ _id: id }).exec();
      if (invitation.adminId) {
        await this.employerAdminModel.deleteOne({ _id: invitation.adminId }).exec();
        return ResponseHandler.success(null, 'Invitation and admin deleted successfully.');
      } else {
        return ResponseHandler.success(null, 'Invitation deleted successfully.');
      }
    } else {
      return ResponseHandler.fail('You cannot delete an accepted invitation');
    }
  }

  async inviteAdmin(invitation, token) {
    const { fullname, emailAddress, role, employerId } = invitation;

    let newInvitation = new this.employerAdminInvitationModel(invitation);
    newInvitation = await newInvitation.save();

    const employer = await this.employerCompaniesService.getEmployerById(employerId);
    const url = EMPLOYER_ADMIN_INVITATION_URL;

    const mailData = {
      to: emailAddress,
      from: process.env.PARTNER_NOREPLY_FROM,
      subject: `Invitation from ${employer.data.title}`,
      template: 'employerAdminInvitation',
      context: {
        unmudlLogo: process.env.UNMUDL_LOGO_PATH,
        siteName: process.env.SITE_NAME,
        fullname,
        role: role[0].toUpperCase() + role.substring(1),
        emailAddress,
        token,
        url,
        employer: employer.data.title,
      },
    };
    const mail = await this.mailerService.sendMail(mailData);

    mail ? this.emailLogsService.createEmailLog(mailData, Portal.EMPLOYER) : null;

    return ResponseHandler.success(newInvitation, responseMessages.success.invitationSent);
  }

  async resendInvitation({ fullname, role, emailAddress, employerId }, token) {
    const employer = await this.employerCompaniesService.getEmployerById(employerId);

    const mailData = {
      to: emailAddress,
      from: process.env.PARTNER_NOREPLY_FROM,
      subject: `Invitation from ${employer.data.title}`,
      template: 'employerAdminInvitation',
      context: {
        unmudlLogo: process.env.UNMUDL_LOGO_PATH,
        siteName: process.env.SITE_NAME,
        fullname,
        role: role[0].toUpperCase() + role.substring(1),
        emailAddress,
        token,
        url: EMPLOYER_ADMIN_INVITATION_URL,
        employer: employer.data.title,
      },
    };
    const mail = await this.mailerService.sendMail(mailData);

    mail ? this.emailLogsService.createEmailLog(mailData, Portal.EMPLOYER) : null;

    return ResponseHandler.success(null, responseMessages.success.invitationSent);
  }

  async acceptInvitation(emailAddress) {
    const invite = await this.employerAdminInvitationModel
      .findOneAndUpdate({ emailAddress }, { $set: { status: 'accepted' } }, { new: true })
      .exec();

    return ResponseHandler.success(invite, responseMessages.success.invitationAccepted);
  }
}
