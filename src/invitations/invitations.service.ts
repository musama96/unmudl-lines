import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nest-modules/mailer';
import ResponseHandler from '../common/ResponseHandler';
import responseMessages from '../config/responseMessages';
import { USER_INVITATION_URL, COLLEGE_INVITATION_URL, COLLEGE_USER_INVITATION_URL } from '../config/config';
import CommonFunctions from '../common/functions';
import { UsersService } from '../users/users.service';
import { UserTokensService } from '../users/userTokens.service';
import { CollegesService } from '../colleges/colleges.service';
import { Portal } from '../email-logs/email-logs.model';
import { EmailLogsService } from '../email-logs/email-logs.service';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel('invitations') private readonly invitationModel,
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService,
    private readonly collegesService: CollegesService,
    private readonly userTokensService: UserTokensService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  async inviteUser(invitation, token) {
    const { fullname, emailAddress, role, collegeId } = invitation;

    let newInvitation = new this.invitationModel(invitation);
    newInvitation = await newInvitation.save();

    const url = collegeId ? COLLEGE_USER_INVITATION_URL : USER_INVITATION_URL;
    const college = await this.collegesService.getCollegeById(collegeId);
    const mailData = {
      to: emailAddress,
      from: collegeId ? process.env.PARTNER_NOREPLY_FROM : process.env.ADMIN_NOREPLY_FROM,
      subject: collegeId ? `Invitation from ${college.data.title}` : 'Invitation from Unmudl',
      template: 'userInvitation',
      context: {
        unmudlLogo: process.env.UNMUDL_LOGO_PATH,
        siteName: process.env.SITE_NAME,
        fullname,
        role: role[0].toUpperCase() + role.substring(1),
        emailAddress,
        token,
        url,
        college: college && college.data ? 'college: ' + college.data.title : 'unmudl',
      },
    };
    const mail = await this.mailerService.sendMail(mailData);

    mail ? this.emailLogsService.createEmailLog(mailData, collegeId ? Portal.COLLEGE : Portal.ADMIN) : null;

    return ResponseHandler.success(newInvitation, responseMessages.success.invitationSent);
  }

  async resendInvitationEmail(invitationId: string) {
    try {
      const invitationData = await this.invitationModel
        .findById(invitationId)
        .lean()
        .exec();
      const user = await this.usersService.getUserByEmail(invitationData.emailAddress);
      const token = await this.userTokensService.createUserToken(user._id.toString());
      const url = user.collegeId ? COLLEGE_USER_INVITATION_URL : USER_INVITATION_URL;
      const { emailAddress, fullname, role } = invitationData;
      const college = await this.collegesService.getCollegeById(user.collegeId);
      const mailData = {
        to: emailAddress,
        from: user.collegeId ? process.env.PARTNER_NOREPLY_FROM : process.env.ADMIN_NOREPLY_FROM,
        subject: user.collegeId ? `Invitation from ${college.data.title}` : 'Invitation from Unmudl',
        template: 'userInvitation',
        context: {
          unmudlLogo: process.env.UNMUDL_LOGO_PATH,
          siteName: process.env.SITE_NAME,
          fullname,
          role: role[0].toUpperCase() + role.substring(1),
          emailAddress,
          token,
          url,
          college: college && college.data ? 'college: ' + college.data.title : 'unmudl',
        },
      };
      const mail = await this.mailerService.sendMail(mailData);

      mail ? this.emailLogsService.createEmailLog(mailData, user.collegeId ? Portal.COLLEGE : Portal.ADMIN) : null;

      return ResponseHandler.success({}, 'Email sent successfully');
    } catch (err) {
      return ResponseHandler.fail('Something went wrong', { err });
    }
  }

  async getInvitationByEmail(emailAddress) {
    const invite = await this.invitationModel
      .findOne({
        emailAddress,
      })
      .exec();

    return ResponseHandler.success(invite);
  }

  async getInvitationById(id: string) {
    const invitation = await this.invitationModel.findById(id).exec();

    return ResponseHandler.success(invitation);
  }

  async acceptInvitation(emailAddress) {
    const invite = await this.invitationModel
      .findOneAndUpdate(
        {
          emailAddress,
        },
        {
          $set: { status: 'accepted' },
        },
        { new: true },
      )
      .exec();

    return ResponseHandler.success(invite, responseMessages.success.invitationAccepted);
  }

  async deleteInvitation(invitationId) {
    await this.invitationModel.deleteOne({ _id: invitationId }).exec();

    return ResponseHandler.success({}, 'Invitation deleted successfully.');
  }

}
