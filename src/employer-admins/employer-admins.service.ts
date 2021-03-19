/* tslint:disable:no-unused-expression */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthCredentialsDto } from '../auth/dto/authCredentialsDto';
import { EMPLOYER_FORGOT_PASSWORD_URL } from '../config/config';
import { EmployerAdmin } from './employer-admin.model';
import { MailerService } from '@nest-modules/mailer';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { InviteEmployerAdminDto } from '../employer-admin-invitations/dto/invite-employer-admin.dto';
import { ListDto } from '../common/dto/list.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { NotificationsService } from '../notifications/notifications.service';

import bcrypt = require('bcryptjs');
import ResponseHandler, { SuccessInterface } from '../common/ResponseHandler';
import mongoose = require('mongoose');
import responseMessages from '../config/responseMessages';

import * as moment from 'moment';
import * as json2csv from 'json2csv';
import { UpdateEmployerAdminRoleDto } from './dto/update-employer-admin-role.dto';
import { Portal } from '../email-logs/email-logs.model';
import { EmailLogsService } from '../email-logs/email-logs.service';
import { EmployerAdminNotificationsIdentifiers } from '../notifications/employerAdminsNotification.model';
import { removeFilesFromS3 } from '../s3upload/s3';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class EmployerAdminsService {
  private saltRounds = 10;

  constructor(
    private readonly mailerService: MailerService,
    private readonly notificationsService: NotificationsService,
    @InjectModel('employer-admins') private readonly employerAdminModel,
    @InjectModel('employer-admin-invitations') private readonly employerAdminInvitationModel,
    @InjectModel('employer-admin-notifications') private readonly employerAdminNotificationModel,
    @InjectModel('trashed-employer-admins') private readonly trashedEmployerAdminModel,
    @InjectModel('id-counters') private readonly counterModel,
    @InjectModel('employer-admin-tokens') private readonly employerAdminTokenModel,
    private readonly emailLogsService: EmailLogsService,
    private readonly chatService: ChatService,
  ) {
  }

  async getAdminsList(params: ListDto) {
    const { keyword, sortOrder, sortBy, employerId, perPage, page } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      invitation: 'accepted',
      role: { $ne: 'system' },
    };

    if (employerId) {
      // @ts-ignore
      match.employerId = mongoose.Types.ObjectId(employerId);
    }

    const pipeline = [
      {
        $match: match,
      },
      {
        $sort: sort,
      },
    ];

    const [admins, rows] = await Promise.all([
      this.employerAdminModel
        .aggregate(pipeline)
        .collation({ locale: 'en', strength: 2 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec(),
      this.employerAdminModel.countDocuments(match).lean(),
    ]);

    return ResponseHandler.success({ admins, rows });
  }

  async getAdminNamesList({ keyword, employerId }: ListDto) {
    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      employerId: mongoose.Types.ObjectId(employerId),
      invitation: 'accepted',
      isSuspended: { $ne: true },
      role: { $ne: 'system' },
    };

    const admins = await this.employerAdminModel
      .find(match, 'fullname emailAddress profilePhoto profilePhotoThumbnail designation')
      .sort({ fullname: 1 })
      .collation({ locale: 'en', strength: 2 })
      .lean();

    return ResponseHandler.success(admins);
  }

  async getAdminsListCsv(params: ListDto) {
    const { keyword, sortOrder, sortBy, employerId } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      fullname: {
        $regex: keyword,
        $options: 'i',
      },
      invitation: 'accepted',
      role: { $ne: 'system' },
    };

    if (employerId) {
      // @ts-ignore
      match.employerId = mongoose.Types.ObjectId(employerId);
    }

    const pipeline = [
      {
        $match: match,
      },
      {
        $project: {
          'Full Name': '$fullname',
          'Email Address': '$emailAddress',
          Role: '$role',
          Designation: '$designation',
          'Last Logged In': { $dateToString: { date: '$lastLoggedIn', format: '%Y-%m-%d' } },
          'Joining Date': { $dateToString: { date: '$joinDate', format: '%Y-%m-%d' } },
          Suspended: { $cond: { if: '$isSuspended', then: 'Yes', else: 'No' } },
        },
      },
      {
        $sort: sort,
      },
    ];

    const admins = await this.employerAdminModel
      .aggregate(pipeline)
      .collation({ locale: 'en', strength: 2 })
      .exec();

    const fields = ['Full Name', 'Email Address', 'Role', 'Designation', 'Last Logged In', 'Joining Date', 'Suspended'];
    return json2csv.parse(admins, { fields });
  }

  async validateEmployerAdminForLogin(authCredentialsDto: AuthCredentialsDto) {
    const { emailAddress, password } = authCredentialsDto;
    const admin = await this.employerAdminModel
      .findOne({ emailAddress })
      .populate('employerId')
      .select('+password')
      .lean()
      .exec();
    if (admin && admin.password && (await this.compareHash(password, admin.password))) {
      return admin;
    }
    if (admin && (admin.isSuspended || (admin.invitation && admin.invitation !== 'accepted'))) {
      return admin;
    }
    return null;
  }

  async updateLastLoggedIn(userId) {
    await this.employerAdminModel
      .findOneAndUpdate(
        {
          _id: userId,
        },
        {
          $set: {
            lastLoggedIn: Date.now(),
          },
        },
      )
      .exec();
  }

  async changePassword(params: UpdatePasswordDto, adminId) {
    let { newPassword } = params;
    const { oldPassword } = params;
    newPassword = await this.getHash(newPassword);
    const user = await this.employerAdminModel
      .findById(adminId)
      .select('+password')
      .exec();
    if (user && (await this.compareHash(oldPassword, user.password))) {
      await this.employerAdminModel.findByIdAndUpdate(user, {
        $set: {
          password: newPassword,
        },
      });
      return ResponseHandler.success(null, responseMessages.success.updatePassword);
    } else {
      return ResponseHandler.fail(responseMessages.updateUser.invalidOldPassword);
    }
  }

  async updatePassword(password: string, adminId: string) {
    try {
      const passwordHash = await this.getHash(password);

      const updatedUser = await this.employerAdminModel.findOneAndUpdate({ _id: adminId }, { password: passwordHash });
      return !!updatedUser;
    } catch {
      return false;
    }
  }

  async updateDetails(details, adminId) {
    const response = await this.employerAdminModel.findByIdAndUpdate(
      adminId,
      {
        $set: details,
      },
      { new: true },
    );

    return ResponseHandler.success(response, responseMessages.success.updateUser);
  }

  async updateRole(updateRole: UpdateEmployerAdminRoleDto, admin) {
    const adminId = mongoose.Types.ObjectId(updateRole.adminId);

    const updatedAdmin = await this.employerAdminModel
      .findOneAndUpdate({
        _id: adminId,
        employerId: admin.employerId,
      }, { $set: { role: updateRole.role } }, { new: true })
      .exec();

    if (updatedAdmin) {
      await this.employerAdminInvitationModel
        .findOneAndUpdate({ emailAddress: updatedAdmin.emailAddress }, { $set: { role: updateRole.role } }, { new: true })
        .exec();

      this.notificationsService.permissionLevelUpdatedForEmployer(updatedAdmin, admin);

      const mailData = {
        to: updatedAdmin.emailAddress,
        from: process.env.PARTNER_NOTIFICATION_FROM,
        subject: 'UNMUDL Notification',
        template: 'updateRole',
        context: {
          unmudlLogo: process.env.UNMUDL_LOGO_PATH,
          date: moment(new Date()).format('LL'),
          user: updatedAdmin,
        },
      };
      const mail = await this.mailerService.sendMail(mailData);

      mail ? this.emailLogsService.createEmailLog(mailData, Portal.EMPLOYER) : null;

      return ResponseHandler.success(updatedAdmin);
    } else {
      return ResponseHandler.fail('Employer admin not found.');
    }
  }

  async createEmployerAdminToken(adminId: string): Promise<string> {
    const token = await this.getHash(adminId);
    const newEmployerAdminToken = new this.employerAdminTokenModel({
      adminId,
      token: encodeURIComponent(token),
    });
    const result = await newEmployerAdminToken.save();
    return result.token;
  }

  async insertInvitedAdmin(admin: InviteEmployerAdminDto) {
    const newAdmin = new this.employerAdminModel(admin);
    newAdmin.invitation = 'pending';
    // console.log('before User save');
    const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { employerAdmin: 1 } }, {
      new: true,
      upsert: true,
    }).lean();
    newAdmin.numId = counter.user;

    const result = await newAdmin.save();
    // console.log('after user save')
    return ResponseHandler.success(result, 'Employer admin created successfully.');
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string) {
    await this.employerAdminModel.findOneAndUpdate({ _id: userId }, { $set: { stripeCustomerId } });
  }

  async removeUser(adminId) {
    const admin = await this.employerAdminModel.findById(adminId).lean();

    const trashedUser = admin;
    trashedUser.adminId = admin._id;
    delete trashedUser._id;
    await Promise.all([this.trashedEmployerAdminModel.create(trashedUser)]);
    await this.employerAdminInvitationModel.deleteOne({ emailAddress: trashedUser.emailAddress });
    return await this.employerAdminModel.deleteOne({ _id: mongoose.Types.ObjectId(adminId) });
  }

  async verifyToken(employerAdminToken: ResetPasswordDto, remove = false) {
    const token = await this.employerAdminTokenModel
      .findOne({ token: employerAdminToken.token })
      .lean()
      .exec();

    if (remove) {
      await this.employerAdminTokenModel.deleteOne({ token: employerAdminToken.token }).exec();
    }

    return token;
  }

  async getUserByEmail(emailAddress: string, lean = false): Promise<SuccessInterface> {
    const exists = this.employerAdminModel.findOne({ emailAddress });
    if (lean) {
      return ResponseHandler.success(await exists.lean());
    } else {
      return ResponseHandler.success(await exists.exec());
    }
  }

  async sendResetPasswordLink(admin: EmployerAdmin): Promise<boolean> {
    try {
      const token = await this.createEmployerAdminToken(admin._id.toString());
      const url = EMPLOYER_FORGOT_PASSWORD_URL;
      const text = 'Click the link to reset your password ' + url + token;
      const mailData = {
        to: admin.emailAddress, // sender address
        from: process.env.PARTNER_NOREPLY_FROM, // list of receivers
        subject: 'Password reset link', // Subject line
        template: 'employerPasswordReset',
        context: {
          unmudlLogo: process.env.UNMUDL_LOGO_PATH,
          siteName: process.env.SITE_NAME,
          url,
          token,
        },
      };
      const mail = await this.mailerService.sendMail(mailData);

      mail ? this.emailLogsService.createEmailLog(mailData, Portal.EMPLOYER) : null;

      return true;
    } catch (e) {
      return false;
    }
  }

  async getAdminByEmail(emailAddress: string, lean = true) {
    const admin = this.employerAdminModel.findOne({ emailAddress });
    if (lean) {
      return await admin.lean();
    } else {
      return await admin.exec();
    }
  }

  async getAdminById(id: string, lean = true) {
    const admin = this.employerAdminModel.findById(id);
    if (lean) {
      return await admin.lean();
    } else {
      return await admin.exec();
    }
  }

  async suspendAdditionalAdmins(employer, limit) {
    const admins = await this.employerAdminModel
      .find({ employerId: employer, isSuspended: { $ne: true }, invitation: 'accepted' })
      .sort({ createdAt: -1 })
      .lean();

    if (admins.length > limit) {
      for (let i = limit; i < admins.length; i++) {
        const admin = admins[i];
        await this.employerAdminModel.findByIdAndUpdate(admin._id, { $set: { isSuspended: true, suspendReason: 'non-payment' } });
      }
    }

    return ResponseHandler.success(null, 'Admins suspended successfully.');
  }

  async unSuspendAdditionalAdmins(employer, limit) {
    const suspendedAdmins = await this.employerAdminModel
      .find({ employerId: employer, suspendReason: 'non-payment' })
      .sort({ createdAt: -1 })
      .lean();
    const activeAdmins = await this.employerAdminModel.countDocuments({ employerId: employer, isSuspended: { $ne: true } }).exec();

    suspendedAdmins.map(async (admin, index) => {
      if (activeAdmins + index < limit) {
        await this.employerAdminModel.findByIdAndUpdate(admin._id, { $set: { isSuspended: false, suspendReason: null } });
      }
    });

    return ResponseHandler.success(null, 'Admins un-suspended successfully.');
  }

  async initializeContactUnmudlChatsForAllEmployerAdmins() {
    let admins = await this.employerAdminModel.find().lean();
    admins = await Promise.all(
      admins.map(async admin => {
        const { data: chats } = await this.chatService.initializeContactUnmudlChats(admin);
        admin.chats = chats;

        return admin;
      }),
    );

    return ResponseHandler.success(admins);
  }

  async getAdminData(id: string) {
    const admin = await this.employerAdminModel
      .findById(id)
      .populate('employerId')
      .lean()
      .exec();

    return ResponseHandler.success({
      user: {
        _id: admin._id,
        fullname: admin.fullname,
        username: admin.username,
        emailAddress: admin.emailAddress,
        profilePhoto: admin.profilePhoto,
        profilePhotoThumbnail: admin.profilePhotoThumbnail,
        employerId: admin.employerId ? admin.employerId._id : null,
        employer: admin.employerId ? admin.employerId.title : null,
        employerDomain: admin.employerId ? admin.employerId.domain : null,
        employerLogo: admin.employerId ? admin.employerId.employerLogo : null,
        employerLogoThumbnail: admin.employerId ? admin.employerId.employerLogoThumbnail : null,
        role: admin.role,
      },
    });
  }

  async getEmployerAdminNotifications(params, user) {
    const { page, perPage } = params;
    const [notifications, unreadNotificationsCount] = await Promise.all([
      this.employerAdminNotificationModel
        .find({ $or: [{ receiver: user._id }, { identifier: EmployerAdminNotificationsIdentifiers.FORUM_POST }] })
        .sort({ updatedAt: -1 })
        .paginate(page, perPage)
        .populate('chat')
        .populate('chatMessage')
        .lean(),
      this.employerAdminNotificationModel.countDocuments({ receiver: user._id, isSeen: false }),
    ]);

    const notificationIds = notifications.map(notification => mongoose.Types.ObjectId(notification._id));
    await this.employerAdminNotificationModel.updateMany(
      { _id: { $in: notificationIds } },
      { $set: { isSeen: true } },
      { multi: true, upsert: false, timestamps: false },
    );

    return ResponseHandler.success({ notifications, unreadNotificationsCount });
  }

  async updateEmployerAdmin(user) {
    user.password = await this.getHash(user.password);
    return await this.employerAdminModel.findOneAndUpdate({ emailAddress: user.emailAddress }, user, { new: true }).lean();
  }

  async updateEmployerAdminById(user, id) {
    let existingUser;
    if (user.profilePhoto) {
      existingUser = await this.employerAdminModel
        .findById(id, 'profilePhoto profilePhotoThumbnail')
        .lean()
        .exec();
      const files = [];
      existingUser.profilePhoto && existingUser.profilePhoto !== user.profilePhoto ? files.push(existingUser.profilePhoto) : null;
      existingUser.profilePhotoThumbnail && existingUser.profilePhotoThumbnail !== user.profilePhotoThumbnail
        ? files.push(existingUser.profilePhotoThumbnail)
        : null;
      files.length > 0 ? await removeFilesFromS3(files) : null;
    }

    const newUser = await this.employerAdminModel.findByIdAndUpdate(id, user, { new: true }).lean();
    return ResponseHandler.success(newUser, 'Profile details updated successfully.');
  }

  async updatePreferences(details, employerAdminId) {
    const notifications = {
      email: details.email,
      proposal: details.proposal,
      chat: details.chat,
      newNotification: details.newNotification,
    };

    const response = await this.employerAdminModel.findByIdAndUpdate(
      employerAdminId,
      {
        $set: {
          notifications,
        },
      },
      { new: true },
    );

    return ResponseHandler.success(response, responseMessages.success.updatePreferences);
  }

  async compareHash(password: string | undefined, hash: string | undefined): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async getHash(password: string | undefined): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
}
