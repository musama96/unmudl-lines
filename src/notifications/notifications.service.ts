import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LearnerNotification, LearnerNotificationsIdentifiers } from './learnersNotification.model';
import { UserNotification, UserNotificationsIdentifiers, UserNotificationTypes } from './usersNotification.model';
import { EnrollmentStatus } from '../common/enums/enrollmentStatus.enum';
import { RefundStatus } from '../common/enums/createRefund.enum';
import { pusher } from '../config/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRoles } from '../users/user.model';
import { MailerService } from '@nest-modules/mailer';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import { BlogStatus } from '../common/enums/createBlog.enum';
import {
  EmployerAdminNotificationsIdentifiers,
  EmployerAdminNotificationTypes,
  EmployerAdminNotification,
} from './employerAdminsNotification.model';
import { Chat } from '../chat/chat.model';
import { ChatModuleEnum } from '../chat/dto/chatList.dto';
import { CourseStatus } from '../courses/courses.model';
import ResponseHandler from '../common/ResponseHandler';
import { EmailLogsService } from '../email-logs/email-logs.service';
import { Portal } from '../email-logs/email-logs.model';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel('user-notifications') private readonly userNotificationsModel,
    @InjectModel('learner-notifications') private readonly learnerNotificationsModel,
    @InjectModel('employer-admin-notifications') private readonly employerAdminNotificationsModel,
    @InjectModel('courses') private readonly coursesModel,
    @InjectModel('enrollments') private readonly enrollmentsModel,
    @InjectModel('users') private readonly usersModel,
    @InjectModel('learners') private readonly learnersModel,
    @InjectModel('employer-admins') private readonly employerAdminsModel,
    @InjectModel('landing-page') private readonly landingPageModel,
    @InjectModel('employer-replies') private readonly employerReplyModel,
    private readonly mailerService: MailerService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  async createNotifications(
    userNotifications?: UserNotification[],
    learnerNotifications?: LearnerNotification[],
    employerAdminNotifications?: EmployerAdminNotification[],
  ) {
    if (userNotifications && userNotifications.length > 0) {
      this.userNotificationsModel.create(userNotifications);
    }
    if (learnerNotifications && learnerNotifications.length > 0) {
      this.learnerNotificationsModel.create(learnerNotifications);
    }
    if (employerAdminNotifications && employerAdminNotifications.length > 0) {
      this.employerAdminNotificationsModel.create(employerAdminNotifications);
    }
  }

  async promoApplied(promo) {
    if (promo.collegeId) {
      const notifications = [];
      const [users, unmudlUsers, user, course, { collegeId }] = await Promise.all([
        this.getUsers(promo.collegeId, ['manager', 'admin', 'superadmin'], promo.addedBy),
        this.getUsers(null, ['manager', 'admin', 'superadmin'], promo.addedBy),
        this.usersModel.findById(promo.addedBy, 'fullname'),
        promo.courses && promo.courses.length === 1 ? this.coursesModel.findById(promo.courses[0]) : null,
        this.coursesModel
          .findOne({ collegeId: mongoose.Types.ObjectId(promo.collegeId) }, 'collegeId')
          .populate('collegeId', 'title')
          .lean(),
      ]);
      users.forEach(userId => {
        notifications.push({
          receiver: userId,
          identifier: UserNotificationsIdentifiers.PROMO_ADDED,
          type: UserNotificationTypes.ALERT,
          promo: promo._id,
          content: `'${user.fullname}' added a new promo '${promo.title}' for ${
            course ? `'` + course.title + `'` : 'your college courses'
          }.`,
          user: user._id,
        });
        pusher.trigger(
          `notification-${userId}`,
          'promo-added',
          `'${user.fullname}' added a new promo '${promo.title}' for ${course ? `'` + course.title + `'` : 'your college courses.'}.`,
        );
      });
      unmudlUsers.forEach(userId => {
        notifications.push({
          receiver: userId,
          identifier: UserNotificationsIdentifiers.PROMO_ADDED,
          type: UserNotificationTypes.ALERT,
          promo: promo._id,
          content: `'${user.fullname}' ${user.collegeId ? 'from ' + `'` + collegeId.title + `' ` : ''}added a new promo '${
            promo.title
          }' for ${course ? `'` + course.title + `'` : `'` + collegeId.title + `' courses`}.`,
          user: user._id,
        });
        pusher.trigger(
          `notification-${userId}`,
          'promo-added',
          `'${user.fullname}' ${user.collegeId ? 'from ' + `'` + collegeId.title + `' ` : ''}added a new promo '${promo.title}' for ${
            course ? `'` + course.title + `'` : `'` + collegeId.title + `' courses`
          }.`,
        );
      });
      await this.createNotifications(notifications, null);
    } else {
      const notifications = [];
      const [users, user] = await Promise.all([
        this.getUsers(null, ['manager', 'admin', 'superadmin'], promo.addedBy),
        this.usersModel.findById(promo.addedBy, 'fullname'),
      ]);

      users.forEach(userId => {
        notifications.push({
          receiver: userId,
          identifier: UserNotificationsIdentifiers.PROMO_ADDED,
          type: UserNotificationTypes.ALERT,
          promo: promo._id,
          content: `'${user.fullname}' added a new universal promo '${promo.title}'.`,
          user: user._id,
        });
        pusher.trigger(`notification-${userId}`, 'promo-added', `'${user.fullname}' added a new universal promo '${promo.title}'`);
      });
      await this.createNotifications(notifications, null);
    }
  }

  async userJoined(user) {
    const notifications = [];
    const users = await this.getUsers(user.collegeId, ['manager', 'admin', 'superadmin'], user._id);
    const content = `'${user.fullname}' joined ${user.collegeId ? 'your college' : 'Unmudl'} as '${user.role}'.`;
    users.forEach(userId => {
      notifications.push({
        receiver: userId,
        identifier: UserNotificationsIdentifiers.USER_JOINED,
        type: UserNotificationTypes.ALERT,
        content,
      });
    });
    await this.createNotifications(notifications, null);
    users.forEach(userId => {
      pusher.trigger(`notification-${userId}`, 'user-joined', content);
    });
  }

  async employerAdminJoined(employerAdmin) {
    const notifications = [];
    const employerAdmins = await this.getEmployerAdmins(employerAdmin.employerId, ['admin', 'superadmin'], employerAdmin._id);
    const content = `'${employerAdmin.fullname}' joined Unmudl as '${employerAdmin.role}'.`;
    employerAdmins.forEach(employerAdminId => {
      notifications.push({
        receiver: employerAdminId,
        identifier: EmployerAdminNotificationsIdentifiers.EMPLOYER_JOINED,
        type: EmployerAdminNotificationTypes.ALERT,
        content,
      });
    });
    await this.createNotifications(null, null, notifications);
    employerAdmins.forEach(employerAdminId => {
      pusher.trigger(`notification-${employerAdminId}`, 'employerAdmin-joined', content);
    });
  }

  async permissionLevelUpdated(modifiedUser, modifyingUser) {
    const notifications = [];
    const users = await this.getUsers(modifiedUser.collegeId, ['manager', 'admin', 'superadmin'], modifyingUser._id);
    users.forEach(userId => {
      notifications.push({
        receiver: userId,
        identifier: UserNotificationsIdentifiers.PERMISSION_LEVEL,
        type: UserNotificationTypes.ALERT,
        content: `'${modifyingUser.fullname}' changed '${modifiedUser.fullname}' to '${modifiedUser.role}'.`,
        user: modifyingUser._id,
        modifiedUser: modifiedUser._id,
      });
    });
    await this.createNotifications(notifications, null);
    users.forEach(userId => {
      pusher.trigger(
        `notification-${userId}`,
        'permission-level-changed',
        `'${modifyingUser.fullname}' changed '${modifiedUser.fullname}' to '${modifiedUser.role}'.`,
      );
    });
  }

  async permissionLevelUpdatedForEmployer(modifiedAdmin, modifyingAdmin) {
    const notifications = [];
    const admins = await this.getEmployerAdmins(modifiedAdmin.collegeId, ['admin', 'superadmin'], modifyingAdmin._id);
    admins.forEach(adminId => {
      notifications.push({
        receiver: adminId,
        identifier: UserNotificationsIdentifiers.PERMISSION_LEVEL,
        type: UserNotificationTypes.ALERT,
        content: `'${modifyingAdmin.fullname}' changed '${modifiedAdmin.fullname}' to '${modifiedAdmin.role}'.`,
        admin: modifyingAdmin._id,
        modifiedAdmin: modifiedAdmin._id,
      });
    });
    await this.createNotifications(null, null, notifications);
    admins.forEach(userId => {
      pusher.trigger(
        `notification-${userId}`,
        'permission-level-changed',
        `'${modifyingAdmin.fullname}' changed '${modifiedAdmin.fullname}' to '${modifiedAdmin.role}'.`,
      );
    });
  }

  async enrollmentStatusChanged(enrollment, course) {
    let content = '';
    if (
      enrollment.status === EnrollmentStatus.APPROVED ||
      enrollment.status === EnrollmentStatus.PROCESSED ||
      enrollment.status === EnrollmentStatus.TRANSFERRED
    ) {
      content = `Your enrollment for course "${course.title}" has been approved.`;
    } else if (enrollment.status === EnrollmentStatus.DECLINED) {
      content = `Your enrollment for course "${course.title}" has been declined.`;
    } else if (enrollment.status === EnrollmentStatus.PENDING) {
      content = `Your enrollment request for course "${course.title}" has been received. The college will get back to you soon with a request for additional information or a decision on admission.`;
    }
    const notification = {
      receiver: enrollment.learnerId,
      identifier: LearnerNotificationsIdentifiers.ENROLLMENT_STATUS,
      content,
      course: enrollment.courseId,
      enrollment: enrollment._id,
    };
    pusher.trigger(`notification-${enrollment.learnerId}`, 'enrollment-status', content);
    // @ts-ignore
    await this.createNotifications(null, [notification]);
  }

  async newChatMessage(chat, message) {
    const employerAdmin = chat.employerAdmins
      .map(admin => (message.employerAdmin && message.employerAdmin._id.toString() === admin._id.toString() ? admin : null))
      .filter(item => item)[0];
    const user = chat.users
      .map(admin => (message.user && message.user._id.toString() === admin._id.toString() ? admin : null))
      .filter(item => item)[0];
    const learner = chat.learner;

    const from = message.learner ? learner : employerAdmin ? employerAdmin : user;
    const fromType = message.learner ? 'learner' : employerAdmin ? 'employerAdmin' : 'user';

    if (learner && !message.learner) {
      await this.learnerNotificationsModel.findOneAndUpdate(
        { 
          receiver: mongoose.Types.ObjectId(learner._id),
          chat: mongoose.Types.ObjectId(chat._id),
          identifier: LearnerNotificationsIdentifiers.NEW_MESSAGE,
        },
        {
          receiver: learner._id,
          from: from._id,
          fromType,
          identifier: LearnerNotificationsIdentifiers.NEW_MESSAGE,
          chat: chat._id,
          chatModule: chat.module,
          chatMessage: message._id,
          isSeen: false,
          createdAt: new Date(),
          content: `You have received a new message from ${from.fullname}.`,
        },
        { upsert: true },
      );
      pusher.trigger(`notification-${learner._id}`, 'new-message', message);
    }
    // console.log(user);
    chat.users.map(async admin => {
      if (!user || user._id.toString() !== admin._id.toString()) {
        await this.userNotificationsModel.findOneAndUpdate(
          { 
            receiver: mongoose.Types.ObjectId(admin._id),
            chat: mongoose.Types.ObjectId(chat._id),
            identifier: UserNotificationsIdentifiers.NEW_MESSAGE, 
          },
          {
            receiver: admin._id,
            from: from._id,
            fromType,
            identifier: UserNotificationsIdentifiers.NEW_MESSAGE,
            chat: chat._id,
            chatModule: chat.module,
            chatMessage: message._id,
            isSeen: false,
            createdAt: new Date(),
            content: `You have received a new message from ${from.fullname}.`,
            type: UserNotificationTypes.HELP_AND_SUPPORT,
            user: from._id,
          },
          { upsert: true },
        );
        pusher.trigger(`notification-${admin._id}`, 'new-message', message);
      }
    });

    chat.employerAdmins.map(async admin => {
      if (!employerAdmin || employerAdmin._id.toString() !== admin._id.toString()) {
        await this.employerAdminNotificationsModel.findOneAndUpdate(
          { 
            receiver: mongoose.Types.ObjectId(admin._id),
            chat: mongoose.Types.ObjectId(chat._id),
            identifier: EmployerAdminNotificationsIdentifiers.NEW_MESSAGE,
          },
          {
            receiver: admin._id,
            from: from._id,
            fromType,
            identifier: EmployerAdminNotificationsIdentifiers.NEW_MESSAGE,
            chat: chat._id,
            chatModule: chat.module,
            chatMessage: message._id,
            isSeen: false,
            createdAt: new Date(),
            content: `You have received a new message from ${from.fullname}.`,
            type: EmployerAdminNotificationTypes.HELP_AND_SUPPORT,
            user: from._id,
          },
          { upsert: true },
        );
        pusher.trigger(`notification-${admin._id}`, 'new-message', message);
      }
    });
  }

  async newMessage(chatMessage) {
    const members = chatMessage.chatId.members.filter(member => member.toString() !== chatMessage.from._id.toString());
    const promises = members.map(member => {
      return this.userNotificationsModel.findOneAndUpdate(
        { receiver: mongoose.Types.ObjectId(member), chatGroup: mongoose.Types.ObjectId(chatMessage.chatId._id) },
        {
          receiver: member,
          chatGroup: chatMessage.chatId._id,
          chatMessage: chatMessage._id,
          identifier: UserNotificationsIdentifiers.NEW_MESSAGE,
          type: UserNotificationTypes.HELP_AND_SUPPORT,
          user: chatMessage.from._id,
          content: `You have received a new message from ${chatMessage.from.fullname}.`,
          createdAt: new Date(),
          isSeen: false,
        },
        { new: true, upsert: true },
      );
    });
    await Promise.all(promises);

    members.forEach(member => {
      pusher.trigger(`notification-${member}`, 'new-message', chatMessage);
    });
  }

  async newEnquiry(enquiryMessage) {
    if (enquiryMessage.learner) {
      const users =
        enquiryMessage.chat.users.length > 0
          ? enquiryMessage.chat.users
          : await this.getUsers(enquiryMessage.chat.course.collegeId, [UserRoles.SUPERADMIN, UserRoles.ADMIN], null);
      if (users.length > 0) {
        const promises = users.map(user => {
          return this.userNotificationsModel.findOneAndUpdate(
            { receiver: mongoose.Types.ObjectId(user), enquiry: mongoose.Types.ObjectId(enquiryMessage.chat._id) },
            {
              receiver: user,
              enquiry: enquiryMessage.chat._id,
              enquiryMessage: enquiryMessage._id,
              identifier: UserNotificationsIdentifiers.NEW_ENQUIRY,
              type: UserNotificationTypes.HELP_AND_SUPPORT,
              learner: enquiryMessage.learner._id,
              content: `${enquiryMessage.learner.fullname} added a message in ${enquiryMessage.chat.course.title}'s inquiry.`,
              createdAt: new Date(),
              isSeen: false,
            },
            { new: true, upsert: true },
          );
        });
        await Promise.all(promises);

        users.forEach(user => {
          pusher.trigger(`notification-${user}`, 'new-enquiry', enquiryMessage);
        });
      }
    } else {
      const content = `${enquiryMessage.user.fullname} added a reply in ${enquiryMessage.chat.course.title}'s inquiry.`;
      await this.learnerNotificationsModel.findOneAndUpdate(
        { receiver: mongoose.Types.ObjectId(enquiryMessage.chat.learner), enquiry: mongoose.Types.ObjectId(enquiryMessage.chat._id) },
        {
          receiver: enquiryMessage.chat.learner,
          enquiry: enquiryMessage.chat._id,
          enquiryMessage: enquiryMessage._id,
          identifier: LearnerNotificationsIdentifiers.NEW_ENQUIRY,
          user: enquiryMessage.user._id,
          content,
          createdAt: new Date(),
          isSeen: false,
        },
        { new: true, upsert: true },
      );
      pusher.trigger(`notification-${enquiryMessage.chat.learner}`, 'new-enquiry', content);

      const users = enquiryMessage.chat.users.filter(user => user.toString() !== enquiryMessage.user._id.toString());
      if (users.length > 0) {
        const promises = users.map(user => {
          return this.userNotificationsModel.findOneAndUpdate(
            { receiver: mongoose.Types.ObjectId(user), enquiry: mongoose.Types.ObjectId(enquiryMessage.chat._id) },
            {
              receiver: user,
              enquiry: enquiryMessage.chat._id,
              enquiryMessage: enquiryMessage._id,
              identifier: UserNotificationsIdentifiers.NEW_ENQUIRY,
              type: UserNotificationTypes.HELP_AND_SUPPORT,
              learner: enquiryMessage.learner._id,
              content: `${enquiryMessage.user.fullname} added a reply in ${enquiryMessage.chat.course.title}'s inquiry.`,
              createdAt: new Date(),
              isSeen: false,
            },
            { new: true, upsert: true },
          );
        });
        await Promise.all(promises);

        users.forEach(user => {
          pusher.trigger(`notification-${user}`, 'new-enquiry', enquiryMessage);
        });
      }
    }
  }

  async newGenericChat(chat) {
    const employerUser =
      chat.module === ChatModuleEnum.SOURCE_TALENT && chat.employerAdmins.length > 0
        ? await this.employerAdminsModel
            .findById(chat.employerAdmins[0], 'employerId')
            .populate('employerId', 'title')
            .lean()
            .exec()
        : null;
    chat.employerAdmins.forEach(member => {
      if (chat.module !== ChatModuleEnum.SOURCE_TALENT) {
        this.employerAdminNotificationsModel.create({
          receiver: member,
          chat: chat._id,
          chatModule: chat.module,
          identifier: EmployerAdminNotificationsIdentifiers.CREATED_CHAT,
          type: EmployerAdminNotificationTypes.HELP_AND_SUPPORT,
          content: chat.createdBy.toString() === member.toString() ? `You just created a chat.` : `You were just added in a chat.`,
        });
      }
    });
    chat.users.forEach(member => {
      this.userNotificationsModel.create({
        receiver: member,
        chat: chat._id,
        chatModule: chat.module,
        identifier:
          chat.module === ChatModuleEnum.SOURCE_TALENT
            ? UserNotificationsIdentifiers.SOURCE_TALENT_REQUEST
            : UserNotificationsIdentifiers.CREATED_CHAT,
        type: chat.module === ChatModuleEnum.SOURCE_TALENT ? UserNotificationTypes.ALERT : UserNotificationTypes.HELP_AND_SUPPORT,
        content:
          chat.createdBy.toString() === member.toString()
            ? `You just created a chat.`
            : chat.module === ChatModuleEnum.SOURCE_TALENT
            ? `You have received a source talent request from '${employerUser.employerId.title}'.`
            : `You were just added in a chat.`,
      });
    });
    if (chat.learner) {
      this.learnerNotificationsModel.create({
        receiver: chat.learner,
        chat: chat._id,
        chatModule: chat.module,
        identifier:
          chat.module === ChatModuleEnum.SOURCE_TALENT
            ? LearnerNotificationsIdentifiers.SOURCE_TALENT_REQUEST
            : LearnerNotificationsIdentifiers.CREATED_CHAT,
        content:
          chat.createdBy.toString() === chat.learner.toString()
            ? `You just created a chat.`
            : chat.module === ChatModuleEnum.SOURCE_TALENT
            ? `You have received a source talent request from '${employerUser.employerId.title}'.`
            : `You were just added in a chat.`,
      });
    }
  }

  async newMembersInChat(chat: Chat, { users, learner, employerAdmins }) {
    if (employerAdmins && employerAdmins.length > 0) {
      users.forEach(member => {
        this.employerAdminNotificationsModel.create({
          receiver: member,
          chat: chat._id,
          chatModule: chat.module,
          identifier: EmployerAdminNotificationsIdentifiers.NEW_CHAT,
          type: EmployerAdminNotificationTypes.HELP_AND_SUPPORT,
          user: chat.createdBy._id,
          content: `You are added in a chat created by ${chat.createdBy.fullname}.`,
        });
      });
    }
    if (users && users.length > 0) {
      users.forEach(member => {
        this.employerAdminNotificationsModel.create({
          receiver: member,
          chat: chat._id,
          chatModule: chat.module,
          identifier: UserNotificationsIdentifiers.NEW_CHAT,
          type: UserNotificationTypes.HELP_AND_SUPPORT,
          user: chat.createdBy._id,
          content: `You are added in a chat created by ${chat.createdBy.fullname}.`,
        });
      });
    }
    if (learner) {
      this.employerAdminNotificationsModel.create({
        receiver: learner,
        chat: chat._id,
        chatModule: chat.module,
        identifier: LearnerNotificationsIdentifiers.NEW_CHAT,
        user: chat.createdBy._id,
        content: `You are added in a chat created by ${chat.createdBy.fullname}.`,
      });
    }
  }

  async newChat(chat, chatMembers) {
    const members = chatMembers.filter(member => member.toString() !== chat.createdBy._id.toString());

    const notifications = [];
    members.forEach(member => {
      notifications.push({
        receiver: member,
        chatGroup: chat._id,
        identifier: UserNotificationsIdentifiers.NEW_CHAT,
        type: UserNotificationTypes.HELP_AND_SUPPORT,
        user: chat.createdBy._id,
        content: `You are added in a chat created by ${chat.createdBy.fullname}.`,
      });
    });

    await this.createNotifications(notifications, null);

    members.forEach(member => {
      pusher.trigger(`notification-${member}`, 'new-chat', chat);
    });
  }

  async refundRequest(refundRequest) {
    let content = '';
    const course = await this.getCourseTitle(refundRequest.courseId);
    // coursesModel.findById(refundRequest.courseId, 'title').lean();
    if ([RefundStatus.REFUNDED, RefundStatus.REJECTED].includes(refundRequest.status)) {
      if (refundRequest.status === RefundStatus.REFUNDED) {
        content = `Your refund request for course "${course.title}" has been approved.`;
      } else if (refundRequest.status === RefundStatus.REJECTED) {
        content = `Your refund request for course "${course.title}" has been declined.`;
      }

      const notification = {
        receiver: refundRequest.learnerId,
        identifier: LearnerNotificationsIdentifiers.REFUND_REQUEST,
        content,
        course: refundRequest.courseId,
        enrollment: refundRequest.enrollmentId,
        status: refundRequest.status,
      };
      // @ts-ignore
      await this.createNotifications(null, [notification]);

      pusher.trigger(`notification-${refundRequest.learnerId}`, 'refund-request', content);
    } else if (refundRequest.status === RefundStatus.PENDING) {
      const [users, unmudlUsers] = await Promise.all([
        this.getUsers(course.collegeId, ['manager', 'admin', 'superadmin']),
        this.getUsers(null, ['manager', 'admin', 'superadmin']),
      ]);
      content = `A learner has requested for refund for course "${course.title}".`;
      const notifications = [];
      users.forEach(userId => {
        notifications.push({
          receiver: userId,
          learner: refundRequest.learnerId,
          identifier: UserNotificationsIdentifiers.REFUND_REQUEST,
          type: UserNotificationTypes.ALERT,
          status: refundRequest.status,
          // channel: 'notification-uadmins',
          content,
        });
        pusher.trigger(`notification-${userId}`, 'refund-request', content);
      });
      unmudlUsers.forEach(userId => {
        notifications.push({
          receiver: userId,
          learner: refundRequest.learnerId,
          identifier: UserNotificationsIdentifiers.REFUND_REQUEST,
          type: UserNotificationTypes.ALERT,
          status: refundRequest.status,
          content,
        });
        pusher.trigger(`notification-${userId}`, 'refund-request', content);
      });
      // @ts-ignore
      await this.createNotifications(notifications, null);
    }
  }

  async reviewReported(report) {
    const course = await this.getCourseByReview(report.reviewId);
    const content = `Your review on course "${course.title}" has been removed with a warning.`;
    const notification = {
      receiver: report.reportedLearnerId,
      identifier: LearnerNotificationsIdentifiers.REVIEW_REPORTED,
      content,
      course: course._id,
    };
    pusher.trigger(`notification-${report.reportedLearnerId}`, 'review-reported', content);
    // @ts-ignore
    await this.createNotifications(null, [notification]);

    pusher.trigger(`notification-cadmins-${report.reportedLearnerId}`, 'review-request', notification);
  }

  // async partnerRequest(request) {
  //   let content = '';
  //   if (request.status === PartnerRequestStatus.APPROVED) {
  //     content = `Your partner request for "${request.title}" has been approved.`;
  //   } else if (request.status === PartnerRequestStatus.REJECTED) {
  //     content = `Your partner request for "${request.title}" has been rejected.`;
  //   }
  //   const notification = {
  //     receiver: request.reportedLearnerId,
  //     identifier: LearnerNotificationsIdentifiers.REVIEW_REPORTED,
  //     content,
  //   };
  //   // @ts-ignore
  //   this.createNotifications(null, [notification]);
  // }

  async courseAdded(course, user) {
    const notifications = [];

    if (course.instructorIds && course.instructorIds[0]) {
      notifications.push({
        receiver: course.instructorIds[0],
        identifier: UserNotificationsIdentifiers.COURSE_ADDED,
        type: UserNotificationTypes.ALERT,
        content: `'${user.fullname}' added you as an instructor on '${course.title}'.`,
        course: course._id,
        user: user._id,
      });
      pusher.trigger(
        `notification-${course.instructorIds[0]}`,
        'course-added',
        `'${user.fullname}' added you as an instructor on '${course.title}'.`,
      );
    }

    const [users, unmudlUsers, { collegeId }] = await Promise.all([
      this.getUsers(course.collegeId, ['manager', 'admin', 'superadmin'], user._id),
      this.getUsers(null, ['manager', 'admin', 'superadmin']),
      this.coursesModel
        .findById(course._id, 'collegeId')
        .populate('collegeId', 'title')
        .lean(),
    ]);
    users.forEach(userId => {
      notifications.push({
        receiver: userId,
        identifier: UserNotificationsIdentifiers.COURSE_ADDED,
        type: UserNotificationTypes.ALERT,
        content: `'${user.fullname}' added a new course '${course.title}'.`,
        course: course._id,
        user: user._id,
      });
      pusher.trigger(`notification-${userId}`, 'course-added', `'${user.fullname}' added a new course '${course.title}'.`);
    });
    unmudlUsers.forEach(userId => {
      notifications.push({
        receiver: userId,
        identifier: UserNotificationsIdentifiers.COURSE_ADDED,
        type: UserNotificationTypes.ALERT,
        content: `'${user.fullname}' from '${collegeId.title}' added a new course '${course.title}'.`,
        course: course._id,
        user: user._id,
      });
      pusher.trigger(
        `notification-${userId}`,
        'course-added',
        `'${user.fullname}' from '${collegeId.title}' added a new course '${course.title}'.`,
      );
    });
    await this.createNotifications(notifications, null);
  }

  async courseEdited(course, user) {
    const notifications = [];

    if (course.instructorIds && course.instructorIds.length > 0 && user._id && course.instructorIds[0].toString() !== user._id.toString()) {
      notifications.push({
        receiver: course.instructorIds[0],
        identifier: UserNotificationsIdentifiers.COURSE_EDITED,
        type: UserNotificationTypes.ALERT,
        content: `'${user.fullname}' edited your course '${course.title}'.`,
        course: course._id,
        user: user._id,
      });
      pusher.trigger(
        `notification-${course.instructorIds[0]}`,
        'course-edited',
        `'${user.fullname}' edited your course '${course.title}'.`,
      );
    }

    const [users, unmudlUsers, { collegeId }] = await Promise.all([
      this.getUsers(course.collegeId, ['manager', 'admin', 'superadmin'], user._id),
      this.getUsers(null, ['manager', 'admin', 'superadmin'], user._id),
      this.coursesModel
        .findById(course._id, 'collegeId')
        .populate('collegeId', 'title')
        .lean(),
    ]);
    users.forEach(userId => {
      notifications.push({
        receiver: userId,
        identifier: UserNotificationsIdentifiers.COURSE_EDITED,
        type: UserNotificationTypes.ALERT,
        content: `'${user.fullname}' edited the course '${course.title}'.`,
        course: course._id,
        user: user._id,
      });
      pusher.trigger(`notification-${userId}`, 'course-edited', `'${user.fullname}' edited the course '${course.title}'.`);
    });
    unmudlUsers.forEach(userId => {
      notifications.push({
        receiver: userId,
        identifier: UserNotificationsIdentifiers.COURSE_EDITED,
        type: UserNotificationTypes.ALERT,
        content: `'${user.fullname}' from '${collegeId.title}' edited the course '${course.title}'.`,
        course: course._id,
        user: user._id,
      });
      pusher.trigger(
        `notification-${userId}`,
        'course-edited',
        `'${user.fullname}' from '${collegeId.title}' edited the course '${course.title}'.`,
      );
    });
    await this.createNotifications(notifications, null);
  }

  async relatedCourseAdded(course) {
    const enrollments = await this.getRelatedCoursesEnrollments(course);
    const learners = [...new Set(enrollments.map(enrollment => enrollment.learnerId))];
    const notifications = [];
    learners.forEach(learner => {
      notifications.push({
        receiver: learner,
        identifier: LearnerNotificationsIdentifiers.RELATED_COURSE,
        content: `Check out the new course "${course.title}" added on UNMUDL.`,
        course: course._id,
      });
      pusher.trigger(
        `notification-uadmins-${learner}`,
        'related-course-add',
        `Check out the new course "${course.title}" added on UNMUDL.`,
      );
    });
    // @ts-ignore
    await this.createNotifications(null, notifications);
  }

  async collegeJoined(college, invitedBy) {
    const notifications = [];
    const [users, invitingUser] = await Promise.all([
      this.getUsers(null, ['moderator', 'admin', 'superadmin'], invitedBy),
      this.usersModel.findById(invitedBy, 'fullname'),
    ]);
    notifications.push({
      receiver: invitedBy,
      identifier: UserNotificationsIdentifiers.COLLEGE_JOINED,
      type: UserNotificationTypes.ALERT,
      content: `'${college.title}' joined UNMUDL on your request.`,
      user: invitedBy,
      college: college._id,
    });
    users.forEach(userId => {
      notifications.push({
        receiver: userId,
        identifier: UserNotificationsIdentifiers.COLLEGE_JOINED,
        type: UserNotificationTypes.ALERT,
        content: `'${college.title}' joined UNMUDL on "${invitingUser.fullname}'s" request.`,
        user: invitedBy,
        college: college._id,
      });
    });
    await this.createNotifications(notifications, null);
    users.forEach(userId => {
      pusher.trigger(
        `notification-${userId}`,
        'college-joined',
        `'${college.title}' joined UNMUDL on "${invitingUser.fullname}'s" request.`,
      );
    });
  }

  async employerJoined(employer, invitedBy) {
    const notifications = [];
    const [users, invitingUser] = await Promise.all([
      this.getUsers(null, ['moderator', 'admin', 'superadmin'], invitedBy),
      this.usersModel.findById(invitedBy, 'fullname'),
    ]);
    notifications.push({
      receiver: invitedBy,
      identifier: UserNotificationsIdentifiers.EMPLOYER_JOINED,
      type: UserNotificationTypes.ALERT,
      content: `'${employer.title}' joined UNMUDL on your request.`,
      user: invitedBy,
      employerCompany: employer._id,
    });
    users.forEach(userId => {
      notifications.push({
        receiver: userId,
        identifier: UserNotificationsIdentifiers.EMPLOYER_JOINED,
        type: UserNotificationTypes.ALERT,
        content: `'${employer.title}' joined UNMUDL on "${invitingUser.fullname}'s" request.`,
        user: invitedBy,
        employerCompany: employer._id,
      });
    });
    await this.createNotifications(notifications, null);
    users.forEach(userId => {
      pusher.trigger(
        `notification-${userId}`,
        'employer-joined',
        `'${employer.title}' joined UNMUDL on "${invitingUser.fullname}'s" request.`,
      );
    });
  }

  async blogStatusChanged(blog, updatingUser) {
    const notifications = [];
    notifications.push({
      receiver: blog.author,
      identifier: UserNotificationsIdentifiers.BLOG_STATUS,
      type: UserNotificationTypes.ALERT,
      content: `Your blog post "${blog.title}" was ${
        blog.status !== BlogStatus.PUBLISHED ? 'denied' : 'accepted for publication'
      } by Unmudl's reviewer.`,
      user: updatingUser,
    });
    pusher.trigger(`notification-${blog.author}`, 'blog-status-updated', notifications[0].content);
    await this.createNotifications(notifications, null);
  }

  async getCourseTitle(courseId: string) {
    return await this.coursesModel.findById(courseId, 'title collegeId').lean();
  }

  async getCourseByReview(reviewId: string) {
    return await this.coursesModel.findOne({ 'reviews._id': mongoose.Types.ObjectId(reviewId) }, 'title').lean();
  }

  async getRelatedCoursesEnrollments(course) {
    const relatedCourses = course.relatedCourses;
    const enrolledStatuses = [EnrollmentStatus.APPROVED, EnrollmentStatus.PENDING, EnrollmentStatus.PROCESSED];
    return await this.enrollmentsModel
      .find({
        courseId: { $in: relatedCourses },
        status: { $in: enrolledStatuses },
      })
      .lean();
  }

  async getUsers(collegeId: string | object, roles: string[], ignore?: string) {
    const find = { collegeId, role: { $in: roles } };
    if (ignore) {
      // @ts-ignore
      find._id = { $ne: mongoose.Types.ObjectId(ignore) };
    }

    const users = await this.usersModel
      .find(find, '_id')
      .lean()
      .exec();
    return users.length > 0 ? users.map(user => user._id) : [];
  }

  async getEmployerAdmins(employerId: string, roles: string[], ignore?: string) {
    const find = { employerId, role: { $in: roles } };
    if (ignore) {
      // @ts-ignore
      find._id = { $ne: mongoose.Types.ObjectId(ignore) };
    }

    const employers = await this.employerAdminsModel
      .find(find, '_id')
      .lean()
      .exec();
    return employers.length > 0 ? employers.map(employer => employer._id) : [];
  }

  async getUserMails(collegeId: string, roles: string[], ignore?: string) {
    const find = { collegeId, role: { $in: roles }, 'notifications.email': true };
    if (ignore) {
      // @ts-ignore
      find._id = { $ne: mongoose.Types.ObjectId(ignore) };
    }

    const users = await this.usersModel
      .find(find, 'emailAddress')
      .lean()
      .exec();
    return users;
  }

  async adminEnrollmentDeadlineNotifications(courseId = null) {
    const match = courseId
      ? {
          _id: mongoose.Types.ObjectId(courseId),
          status: CourseStatus.LIVE,
          enrollmentDeadline: {
            $gte: new Date(
              moment()
                .add(2, 'day')
                .startOf('day')
                .toISOString(),
            ),
            $lt: new Date(
              moment()
                .add(3, 'day')
                .startOf('day')
                .toISOString(),
            ),
          },
        }
      : {
          unpublishedDate: null,
          status: { $nin: [CourseStatus.CANCELED, CourseStatus.COMING_SOON] },
          enrollmentDeadline: {
            $gte: new Date(
              moment()
                .add(2, 'day')
                .startOf('day')
                .toISOString(),
            ),
            $lt: new Date(
              moment()
                .add(3, 'day')
                .startOf('day')
                .toISOString(),
            ),
          },
        };
    // console.log(match);
    const courses = await this.coursesModel.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: 'users',
          let: { collegeId: '$collegeId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$collegeId', '$$collegeId'] },
                    { $in: ['$role', [UserRoles.SUPERADMIN, UserRoles.ADMIN]] },
                    { $eq: ['$notifications.email', true] },
                  ],
                },
              },
            },
          ],
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ]);

    if (courses && courses.length > 0) {
      for (let i = 0; i < courses.length; i++) {
        setTimeout(async () => {
          const mailData = {
            to: courses[i].user.emailAddress,
            from: process.env.PARTNER_NOTIFICATION_FROM,
            subject: 'An Unmudl course listing is about to expire',
            template: 'enrollmentDeadlineMail',
            context: {
              unmudlLogo: process.env.UNMUDL_LOGO_PATH,
              date: moment(new Date()).format('LL'),
              course: courses[i],
            },
          };
          const mail = await this.mailerService.sendMail(mailData);

          mail ? this.emailLogsService.createEmailLog(mailData, Portal.ADMIN) : null;
        }, 1000);
      }
    }
    return true;
  }

  async getSourceTalentActivity(params) {
    const { user, userType, page, perPage, sortBy, sortOrder } = params;

    let activities = [];
    let rows = 0;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = { receiver: mongoose.Types.ObjectId(user), chatModule: 'source-talent' };

    const pipeline = [
      { $match: match },
      { $sort: sort },
      { $skip: (page - 1) * perPage },
      { $limit: perPage },
      {
        $lookup: {
          from: userType === 'user' ? 'users' : 'employer-admins',
          localField: 'receiver',
          foreignField: '_id',
          as: 'receiver',
        },
      },
      { $unwind: '$receiver' },
      {
        $lookup: {
          from: 'chats',
          localField: 'chat',
          foreignField: '_id',
          as: 'chat',
        },
      },
      { $unwind: '$chat' },
      {
        $lookup: {
          from: 'source-talents',
          localField: 'chat.moduleDocumentId',
          foreignField: '_id',
          as: 'sourceTalent',
        },
      },
      { $unwind: '$sourceTalent' },
      {
        $lookup: {
          from: 'courses',
          localField: 'chat.course',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $lookup: {
          from: 'colleges',
          localField: 'course.collegeId',
          foreignField: '_id',
          as: 'college',
        },
      },
      { $unwind: '$college' },
      {
        $lookup: {
          from: 'users',
          localField: 'from',
          foreignField: '_id',
          as: 'fromUser',
        },
      },
      {
        $unwind: {
          path: '$fromUser',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'employer-admins',
          localField: 'from',
          foreignField: '_id',
          as: 'fromEmployerAdmin',
        },
      },
      {
        $unwind: {
          path: '$fromEmployerAdmin',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'learners',
          localField: 'from',
          foreignField: '_id',
          as: 'fromLearner',
        },
      },
      {
        $unwind: {
          path: '$fromLearner',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          from: {
            $switch: {
              branches: [
                { case: { $eq: ['$fromType', 'learner'] }, then: '$fromLearner' },
                { case: { $eq: ['$fromType', 'employerAdmin'] }, then: '$fromEmployerAdmin' },
                { case: { $eq: ['$fromType', 'user'] }, then: '$fromUser' },
              ],
            },
          },
        },
      },
      {
        $project: {
          receiver: '$receiver.fullname',
          receiverDesignation: '$receiver.designation',
          receiverRole: '$receiver.role',
          receiverProfilePhoto: '$receiver.profilePhoto',
          receiverProfilePhotoThumbnail: '$receiver.profilePhotoThumbnail',
          course: '$course.title',
          college: '$college.title',
          sourceTalentTitle: '$sourceTalent.title',
          from: '$from.fullname',
          fromDesignation: '$from.designation',
          fromRole: '$from.role',
          fromProfilePhoto: '$from.profilePhoto',
          fromProfilePhotoThumbnail: '$from.profilePhotoThumbnail',
          fromType: 1,
          identifier: 1,
          type: 1,
          content: 1,
          createdAt: 1,
        },
      },
    ];

    switch (userType) {
      case 'user':
        [activities, rows] = await Promise.all([
          await this.userNotificationsModel.aggregate(pipeline).exec(),
          await this.userNotificationsModel.countDocuments(match).exec(),
        ]);
        break;
      case 'employerAdmin':
        [activities, rows] = await Promise.all([
          await this.employerAdminNotificationsModel.aggregate(pipeline).exec(),
          await this.employerAdminNotificationsModel.countDocuments(match).exec(),
        ]);
        break;
    }

    return ResponseHandler.success({ activities, rows });
  }

  async getContactCollegesActivity(params) {
    const { user, userType, page, perPage, sortBy, sortOrder } = params;

    let activities = [];
    let rows = 0;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      receiver: mongoose.Types.ObjectId(user),
      $or: [{ $expr: { $eq: ['$identifier', 'proposalResponse'] } }, { $expr: { $eq: ['$chatModule', 'employer-proposal-response'] } }],
    };

    const pipeline = [
      { $match: match },
      { $sort: sort },
      { $skip: (page - 1) * perPage },
      { $limit: perPage },
      {
        $lookup: {
          from: userType === 'user' ? 'users' : 'employer-admins',
          localField: 'receiver',
          foreignField: '_id',
          as: 'receiver',
        },
      },
      { $unwind: '$receiver' },
      {
        $lookup: {
          from: 'chats',
          localField: 'chat',
          foreignField: '_id',
          as: 'chat',
        },
      },
      {
        $unwind: {
          path: '$chat',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'contact-college-responses',
          localField: 'chat.moduleDocumentId',
          foreignField: '_id',
          as: 'proposalResponse',
        },
      },
      {
        $unwind: {
          path: '$proposalResponse',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'contact-college-proposals',
          localField: 'proposalResponse.proposal',
          foreignField: '_id',
          as: 'proposal',
        },
      },
      {
        $unwind: {
          path: '$proposal',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'proposalResponse.appliedBy',
          foreignField: '_id',
          as: 'from',
        },
      },
      {
        $unwind: {
          path: '$from',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'colleges',
          localField: 'from.collegeId',
          foreignField: '_id',
          as: 'college',
        },
      },
      {
        $unwind: {
          path: '$college',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          receiver: '$receiver.fullname',
          receiverDesignation: '$receiver.designation',
          receiverRole: '$receiver.role',
          receiverProfilePhoto: '$receiver.profilePhoto',
          receiverProfilePhotoThumbnail: '$receiver.profilePhotoThumbnail',
          course: '$course.title',
          proposalTitle: '$proposal.title',
          college: '$college.title',
          from: '$from.fullname',
          fromDesignation: '$from.designation',
          fromRole: '$from.role',
          fromProfilePhoto: '$from.profilePhoto',
          fromProfilePhotoThumbnail: '$from.profilePhotoThumbnail',
          fromType: 1,
          identifier: 1,
          type: 1,
          content: 1,
          chatModule: 1,
          createdAt: 1,
        },
      },
    ];

    switch (userType) {
      case 'user':
        [activities, rows] = await Promise.all([
          await this.userNotificationsModel.aggregate(pipeline).exec(),
          await this.userNotificationsModel.countDocuments(match).exec(),
        ]);
        break;
      case 'employerAdmin':
        [activities, rows] = await Promise.all([
          await this.employerAdminNotificationsModel.aggregate(pipeline).exec(),
          await this.employerAdminNotificationsModel.countDocuments(match).exec(),
        ]);
        break;
    }

    return ResponseHandler.success({ activities, rows });
  }

  async getEmployerForumActivity(params) {
    const { user, userType, page, perPage, sortBy, sortOrder } = params;

    let activities = [];
    let rows = 0;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const match = {
      receiver: mongoose.Types.ObjectId(user),
      $expr: { $in: ['$identifier', ['forumComment', 'forumPost', 'forumReply']] },
    };

    const pipeline = [
      { $match: match },
      { $sort: sort },
      { $skip: (page - 1) * perPage },
      { $limit: perPage },
      {
        $lookup: {
          from: 'employer-posts',
          let: { postId: '$forumPost' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$postId'],
                },
              },
            },
            {
              $lookup: {
                from: 'employer-admins',
                localField: 'employerAdmin',
                foreignField: '_id',
                as: 'employerAdmin',
              },
            },
            {
              $unwind: {
                path: '$employerAdmin',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'post',
        },
      },
      {
        $unwind: {
          path: '$post',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'employer-comments',
          let: { commentId: '$forumComment' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$commentId'],
                },
              },
            },
            {
              $lookup: {
                from: 'employer-admins',
                localField: 'employerAdmin',
                foreignField: '_id',
                as: 'employerAdmin',
              },
            },
            {
              $unwind: {
                path: '$employerAdmin',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                user: {
                  $cond: {
                    if: '$user',
                    then: '$user',
                    else: '$employerAdmin',
                  },
                },
              },
            },
          ],
          as: 'comment',
        },
      },
      {
        $unwind: {
          path: '$comment',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'employer-replies',
          let: { replyId: '$forumReply' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$replyId'],
                },
              },
            },
            {
              $lookup: {
                from: 'employer-admins',
                localField: 'employerAdmin',
                foreignField: '_id',
                as: 'employerAdmin',
              },
            },
            {
              $unwind: {
                path: '$employerAdmin',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                user: {
                  $cond: {
                    if: '$user',
                    then: '$user',
                    else: '$employerAdmin',
                  },
                },
              },
            },
          ],
          as: 'reply',
        },
      },
      {
        $unwind: {
          path: '$reply',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          user: {
            $switch: {
              branches: [
                { case: { $eq: ['$identifier', 'forumPost'] }, then: '$post.employerAdmin' },
                { case: { $eq: ['$identifier', 'forumComment'] }, then: '$comment.user' },
                { case: { $eq: ['$identifier', 'forumReply'] }, then: '$reply.user' },
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'employer-companies',
          localField: 'user.employerId',
          foreignField: '_id',
          as: 'employer',
        },
      },
      {
        $unwind: {
          path: '$employer',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          post: { $cond: { if: '$post.title', then: '$post.title', else: '$post.topic' } },
          employer: '$employer.title',
          from: '$user.fullname',
          fromDesignation: '$user.designation',
          fromRole: '$user.role',
          fromProfilePhoto: '$user.profilePhoto',
          fromProfilePhotoThumbnail: '$user.profilePhotoThumbnail',
          fromType: '$user.type',
          identifier: 1,
          type: 1,
          content: 1,
          createdAt: 1,
        },
      },
    ];

    switch (userType) {
      case 'user':
        [activities, rows] = await Promise.all([
          await this.userNotificationsModel.aggregate(pipeline).exec(),
          await this.userNotificationsModel.countDocuments(match).exec(),
        ]);
        break;
      case 'employerAdmin':
        [activities, rows] = await Promise.all([
          await this.employerAdminNotificationsModel.aggregate(pipeline).exec(),
          await this.employerAdminNotificationsModel.countDocuments(match).exec(),
        ]);
        break;
    }

    return ResponseHandler.success({ activities, rows });
  }

  async newProposal(proposal) {
    const [users, employerUser] = await Promise.all([
      this.getUsers(proposal.visibility !== 'all' ? { $in: proposal.colleges } : { $ne: null }, [UserRoles.ADMIN, UserRoles.SUPERADMIN]),
      this.employerAdminsModel
        .findOne({ employerId: mongoose.Types.ObjectId(proposal.employer) }, 'employerId')
        .populate('employerId', 'title')
        .lean()
        .exec(),
    ]);

    const notifications = [];
    users.forEach(userId => {
      notifications.push({
        receiver: userId,
        identifier: UserNotificationsIdentifiers.NEW_PROPOSAL,
        type: UserNotificationTypes.ALERT,
        content: `You have just received a new proposal from '${employerUser.employerId.title}'.`,
      });
      pusher.trigger(`notification-${userId}`, 'new-proposal', proposal);
    });

    await this.createNotifications(notifications, null);
  }

  async newProposalResponse(proposalResponse) {
    const employerUsers = await this.employerAdminsModel
      .find({ employerId: proposalResponse.proposedBy.employerId }, '_id')
      .lean()
      .exec();

    const notifications = [];
    employerUsers.forEach(userId => {
      notifications.push({
        receiver: userId._id,
        identifier: EmployerAdminNotificationsIdentifiers.PROPOSAL_RESPONSE,
        type: EmployerAdminNotificationTypes.ALERT,
        chat: proposalResponse.chat,
        content: `You have just received a new response to your proposal '${proposalResponse.proposal.title}'.`,
      });
      pusher.trigger(`notification-${userId._id}`, 'new-proposal-response', proposalResponse);
    });

    await this.createNotifications(null, null, notifications);
  }

  async newEmployerForumPost(post) {
    try {
      await post
        .populate('user', 'fullname')
        .populate('employerAdmin', 'fullname')
        .execPopulate();

      const [notifications, userNotifications] = [[], []];
      notifications.push({
        identifier: EmployerAdminNotificationsIdentifiers.FORUM_POST,
        type: EmployerAdminNotificationTypes.ALERT,
        forumPost: post._id,
        content: `${post.user ? post.user.fullname : post.employerAdmin.fullname} posted a new topic '${post.topic}'.`,
      });

      userNotifications.push({
        identifier: UserNotificationsIdentifiers.EMPLOYER_FORUM_POST,
        type: EmployerAdminNotificationTypes.ALERT,
        forumPost: post._id,
        content: `${post.user ? post.user.fullname : post.employerAdmin.fullname} posted a new topic '${post.topic}'.`,
      });
      // pusher.trigger(`notification-${post.employerAdmin}`, 'new-forum-post', post);
      await this.createNotifications(userNotifications, null, notifications);
    } catch (err) {
      console.log(err);
      return true;
    }
  }

  async newEmployerForumComment(comment) {
    try {
      if (comment.employerPost.employerAdmin) {
        const notifications = [];
        notifications.push({
          receiver: comment.employerPost.employerAdmin,
          identifier: EmployerAdminNotificationsIdentifiers.FORUM_COMMENT,
          type: EmployerAdminNotificationTypes.ALERT,
          forumPost: comment.employerPost._id,
          forumComment: comment._id,
          content: `${comment.user ? comment.user.fullname : comment.employerAdmin.fullname} replied to your topic '${
            comment.employerPost.topic
          }'.`,
        });
        pusher.trigger(`notification-${comment.employerPost.employerAdmin}`, 'new-forum-comment', comment);
        await this.createNotifications(null, null, notifications);
      } else {
        const notifications = [];
        notifications.push({
          receiver: comment.employerPost.user,
          identifier: UserNotificationsIdentifiers.EMPLOYER_FORUM_COMMENT,
          type: UserNotificationTypes.ALERT,
          employerForumPost: comment.employerPost._id,
          employerForumComment: comment._id,
          content: `${comment.user ? comment.user.fullname : comment.employerAdmin.fullname} replied to your topic '${
            comment.employerPost.topic
          }'.`,
        });
        pusher.trigger(`notification-${comment.employerPost.user}`, 'new-forum-comment', comment);
        await this.createNotifications(notifications, null, null);
      }
    } catch (err) {
      console.log(err);
      return true;
    }
  }

  async newEmployerForumReply(reply) {
    try {
      await reply
        .populate({
          path: 'employerComment',
          select: 'employerPost',
          populate: {
            path: 'employerPost',
            select: 'topic user employerAdmin',
          },
        })
        .execPopulate();
      if (reply.employerComment.employerPost.employerAdmin) {
        const notifications = [];
        notifications.push({
          receiver: reply.employerComment.employerPost.employerAdmin,
          identifier: EmployerAdminNotificationsIdentifiers.FORUM_REPLY,
          type: EmployerAdminNotificationTypes.ALERT,
          forumPost: reply.employerComment.employerPost._id,
          forumComment: reply.employerComment._id,
          forumReply: reply._id,
          content: `${reply.user ? reply.user.fullname : reply.employerAdmin.fullname} replied to your comment on topic '${
            reply.employerComment.employerPost.topic
          }'.`,
        });
        pusher.trigger(`notification-${reply.employerComment.employerPost.employerAdmin}`, 'new-forum-reply', reply);
        await this.createNotifications(null, null, notifications);
      } else {
        const notifications = [];
        notifications.push({
          receiver: reply.employerComment.employerPost.user,
          identifier: UserNotificationsIdentifiers.EMPLOYER_FORUM_REPLY,
          type: UserNotificationTypes.ALERT,
          employerForumPost: reply.employerComment.employerPost._id,
          employerForumComment: reply.employerComment._id,
          employerForumReply: reply._id,
          content: `${reply.user ? reply.user.fullname : reply.employerAdmin.fullname} replied to your comment on topic '${
            reply.employerComment.employerPost.topic
          }'.`,
        });
        pusher.trigger(`notification-${reply.employerComment.employerPost.user}`, 'new-forum-reply', reply);
        await this.createNotifications(notifications, null, null);
      }
    } catch (err) {
      console.log(err);
      return true;
    }
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron('0 0 0 * * *')
  async unmudlUserDailyPerformance() {
    const [users, newEnrollment, revenueData] = await Promise.all([
      this.getUsers(null, ['manager', 'admin', 'superadmin']),
      this.enrollmentsModel.countDocuments({
        createdAt: {
          $lt: new Date(),
          $gte: new Date(
            moment()
              .subtract(1, 'day')
              .toISOString(),
          ),
        },
      }),
      this.enrollmentsModel.aggregate([
        {
          $match: {
            status: { $in: [EnrollmentStatus.TRANSFERRED, EnrollmentStatus.PROCESSED] },
            updatedAt: {
              $lt: new Date(),
              $gte: new Date(
                moment()
                  .subtract(1, 'day')
                  .toISOString(),
              ),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalRevenue' },
            unmudlRevenue: { $sum: '$unmudlShare' },
          },
        },
      ]),
    ]);
    const revenue = revenueData ? revenueData[0] : null;
    const notifications = [];
    users.forEach(userId => {
      notifications.push({
        receiver: userId,
        identifier: UserNotificationsIdentifiers.DAILY_ENROLLMENTS,
        type: UserNotificationTypes.SALES,
        content: `${newEnrollment} new enrollments added on Unmudl in the last 24 hours.`,
      });
      if (revenue) {
        notifications.push({
          receiver: userId,
          identifier: UserNotificationsIdentifiers.DAILY_REVENUE,
          type: UserNotificationTypes.SALES,
          content: `Total revenue for last 24 hours was $${revenue.totalRevenue.toFixed(2)} and Unmudl revenue was $
          ${revenue.unmudlRevenue.toFixed(2)}.`,
        });
      }
    });
    await this.createNotifications(notifications, null);
  }

  @Cron('0 0 0 * * *')
  async CollegeDailyNotifications() {
    const [
      courseDeadlineNotifications,
      enrollmentClosedNotifications,
      newEnrollmentNotifications,
      revenueNotifications,
    ] = await Promise.all([
      this.coursesModel.aggregate([
        {
          $match: {
            enrollmentDeadline: {
              $gt: new Date(),
              $lte: new Date(
                moment()
                  .add(7, 'day')
                  .toISOString(),
              ),
            },
            instructorIds: { $size: 1 },
          },
        },
        {
          $addFields: {
            daysLeft: { $trunc: { $divide: [{ $subtract: ['$enrollmentDeadline', new Date()] }, 1000 * 60 * 60 * 24] } },
          },
        },
        {
          $project: {
            _id: 0,
            receiver: { $arrayElemAt: ['$instructorIds', 0] },
            identifier: UserNotificationsIdentifiers.COURSE_DEADLINE,
            type: UserNotificationTypes.ALERT,
            course: '$_id',
            content: { $concat: ['Deadline for your course "', '$title', '" is in ', { $toString: '$daysLeft' }, ' days.'] },
          },
        },
      ]),
      this.coursesModel.aggregate([
        {
          $match: {
            enrollmentDeadline: {
              $lt: new Date(),
              $gte: new Date(
                moment()
                  .subtract(1, 'day')
                  .toISOString(),
              ),
            },
            instructorIds: { $size: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            receiver: { $arrayElemAt: ['$instructorIds', 0] },
            identifier: UserNotificationsIdentifiers.ENROLLMENT_CLOSED,
            type: UserNotificationTypes.ALERT,
            course: '$_id',
            content: { $concat: ['Your course "', '$title', '" is now closed for enrollment.'] },
          },
        },
      ]),
      this.enrollmentsModel.aggregate([
        {
          $match: {
            createdAt: {
              $lt: new Date(),
              $gte: new Date(
                moment()
                  .subtract(1, 'day')
                  .toISOString(),
              ),
            },
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'colleges',
            localField: 'course.collegeId',
            foreignField: '_id',
            as: 'college',
          },
        },
        { $unwind: '$college' },
        {
          $group: {
            _id: '$college._id',
            newEnrollments: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'users',
            let: { collegeId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$collegeId', '$$collegeId'] },
                      { $in: ['$role', [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MANAGER]] },
                    ],
                  },
                },
              },
            ],
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            receiver: '$user._id',
            identifier: UserNotificationsIdentifiers.DAILY_ENROLLMENTS,
            type: UserNotificationTypes.SALES,
            content: { $concat: [{ $toString: '$newEnrollments' }, ' learners enrolled in your courses in last 24 hours'] },
          },
        },
      ]),
      this.enrollmentsModel.aggregate([
        {
          $match: {
            updatedAt: {
              $lt: new Date(),
              $gte: new Date(
                moment()
                  .subtract(1, 'day')
                  .toISOString(),
              ),
            },
            status: { $in: [EnrollmentStatus.PROCESSED, EnrollmentStatus.TRANSFERRED] },
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course',
          },
        },
        { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'colleges',
            localField: 'course.collegeId',
            foreignField: '_id',
            as: 'college',
          },
        },
        { $unwind: '$college' },
        {
          $group: {
            _id: '$college._id',
            revenue: { $sum: '$collegeShare' },
          },
        },
        { $addFields: { revenue: { $round: ['$revenue', 2] } } },
        {
          $lookup: {
            from: 'users',
            let: { collegeId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$collegeId', '$$collegeId'] },
                      { $in: ['$role', [UserRoles.SUPERADMIN, UserRoles.ADMIN, UserRoles.MANAGER]] },
                    ],
                  },
                },
              },
            ],
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            receiver: '$user._id',
            identifier: UserNotificationsIdentifiers.DAILY_REVENUE,
            type: UserNotificationTypes.SALES,
            content: { $concat: ['Your revenue for last 24 hours was $', { $toString: '$revenue' }] },
          },
        },
      ]),
    ]);
    await Promise.all([
      courseDeadlineNotifications && courseDeadlineNotifications.length > 0
        ? this.createNotifications(courseDeadlineNotifications, null)
        : null,
      enrollmentClosedNotifications && enrollmentClosedNotifications.length > 0
        ? this.createNotifications(enrollmentClosedNotifications, null)
        : null,
      newEnrollmentNotifications && newEnrollmentNotifications.length > 0
        ? this.createNotifications(newEnrollmentNotifications, null)
        : null,
      revenueNotifications && revenueNotifications.length > 0 ? this.createNotifications(revenueNotifications, null) : null,
    ]);
  }

  @Cron('0 0 0 * * *')
  async LearnerEnrollmentDeadlineNotifications() {
    const learnerEnrollmentDeadlineNotifications = await this.learnersModel.aggregate([
      { $match: { cart: { $exists: true, $ne: [] } } },
      {
        $lookup: {
          from: 'courses',
          localField: 'cart.course',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $match: {
          'course.enrollmentDeadline': {
            $gt: new Date(),
            $lte: new Date(
              moment()
                .add(1, 'day')
                .toISOString(),
            ),
          },
        },
      },
      {
        $project: {
          _id: 0,
          receiver: '$_id',
          identifier: LearnerNotificationsIdentifiers.ENROLLMENT_DEADLINE,
          content: { $concat: ['The deadline for course ', '$course.title', ' ends in 1 day.'] },
          course: '$course._id',
        },
      },
    ]);

    if (learnerEnrollmentDeadlineNotifications && learnerEnrollmentDeadlineNotifications.length > 0) {
      await this.createNotifications(null, learnerEnrollmentDeadlineNotifications);
    }
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron('0 0 0 * * *')
  async AdminEnrollmentDeadlineNotificationsCron() {
    await this.adminEnrollmentDeadlineNotifications();
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron('0 0 0 * * *')
  async AdminLandingPageEnrollmentDeadlineNotificationsCron() {
    const landingPageData = await this.landingPageModel
      .findOne()
      .populate('featured', 'title enrollmentDeadline')
      .populate('highlyRated', 'title enrollmentDeadline')
      .populate('credentialCourses', 'title enrollmentDeadline')
      .lean()
      .exec();
    const courses = [];
    const admins = await this.usersModel
      .find(
        {
          invitation: { $ne: 'pending' },
          collegeId: null,
          role: { $in: [UserRoles.SUPERADMIN, UserRoles.ADMIN] },
          'notifications.email': true,
        },
        'emailAddress',
      )
      .lean()
      .exec();

    if (!landingPageData.hideFeatured) {
      landingPageData.featured.map(course => {
        if (
          moment(course.enrollmentDeadline).isSameOrAfter(
            moment()
              .add(1, 'day')
              .startOf('day'),
          ) &&
          moment(course.enrollmentDeadline).isBefore(
            moment()
              .add(2, 'day')
              .startOf('day'),
          )
        ) {
          courses.push(course);
        }
      });
    }

    if (!landingPageData.hideHighlyRated) {
      landingPageData.highlyRated.map(course => {
        if (
          moment(course.enrollmentDeadline).isSameOrAfter(
            moment()
              .add(1, 'day')
              .startOf('day'),
          ) &&
          moment(course.enrollmentDeadline).isBefore(
            moment()
              .add(2, 'day')
              .startOf('day'),
          )
        ) {
          courses.push(course);
        }
      });
    }

    if (!landingPageData.hideCredentialCourses) {
      landingPageData.credentialCourses.map(course => {
        if (
          moment(course.enrollmentDeadline).isSameOrAfter(
            moment()
              .add(1, 'day')
              .startOf('day'),
          ) &&
          moment(course.enrollmentDeadline).isBefore(
            moment()
              .add(2, 'day')
              .startOf('day'),
          )
        ) {
          courses.push(course);
        }
      });
    }
    const mails = [];
    admins.map(user => {
      courses.map(course => {
        mails.push({ course, user });
      });
    });
    // console.log(mails);
    if (mails && mails.length > 0) {
      for (let i = 0; i < mails.length; i++) {
        setTimeout(async () => {
          const mailData = {
            to: mails[i].user.emailAddress,
            from: process.env.ADMIN_NOTIFICATION_FROM,
            subject: 'Landing page course about to expire',
            template: 'landingPageEnrollmentDeadlineMail',
            context: {
              unmudlLogo: process.env.UNMUDL_LOGO_PATH,
              date: moment(new Date()).format('LL'),
              course: mails[i].course,
            },
          };
          const mail = await this.mailerService.sendMail(mailData);

          mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;
        }, 1000);
      }
    }
    // console.log('done');
    return true;
  }
}
