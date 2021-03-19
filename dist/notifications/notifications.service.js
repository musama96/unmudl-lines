"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const learnersNotification_model_1 = require("./learnersNotification.model");
const usersNotification_model_1 = require("./usersNotification.model");
const enrollmentStatus_enum_1 = require("../common/enums/enrollmentStatus.enum");
const createRefund_enum_1 = require("../common/enums/createRefund.enum");
const config_1 = require("../config/config");
const schedule_1 = require("@nestjs/schedule");
const user_model_1 = require("../users/user.model");
const mailer_1 = require("@nest-modules/mailer");
const mongoose = require("mongoose");
const moment = require("moment");
const createBlog_enum_1 = require("../common/enums/createBlog.enum");
const employerAdminsNotification_model_1 = require("./employerAdminsNotification.model");
const chatList_dto_1 = require("../chat/dto/chatList.dto");
const courses_model_1 = require("../courses/courses.model");
const ResponseHandler_1 = require("../common/ResponseHandler");
const email_logs_service_1 = require("../email-logs/email-logs.service");
const email_logs_model_1 = require("../email-logs/email-logs.model");
let NotificationsService = class NotificationsService {
    constructor(userNotificationsModel, learnerNotificationsModel, employerAdminNotificationsModel, coursesModel, enrollmentsModel, usersModel, learnersModel, employerAdminsModel, landingPageModel, employerReplyModel, mailerService, emailLogsService) {
        this.userNotificationsModel = userNotificationsModel;
        this.learnerNotificationsModel = learnerNotificationsModel;
        this.employerAdminNotificationsModel = employerAdminNotificationsModel;
        this.coursesModel = coursesModel;
        this.enrollmentsModel = enrollmentsModel;
        this.usersModel = usersModel;
        this.learnersModel = learnersModel;
        this.employerAdminsModel = employerAdminsModel;
        this.landingPageModel = landingPageModel;
        this.employerReplyModel = employerReplyModel;
        this.mailerService = mailerService;
        this.emailLogsService = emailLogsService;
    }
    async createNotifications(userNotifications, learnerNotifications, employerAdminNotifications) {
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
                    identifier: usersNotification_model_1.UserNotificationsIdentifiers.PROMO_ADDED,
                    type: usersNotification_model_1.UserNotificationTypes.ALERT,
                    promo: promo._id,
                    content: `'${user.fullname}' added a new promo '${promo.title}' for ${course ? `'` + course.title + `'` : 'your college courses'}.`,
                    user: user._id,
                });
                config_1.pusher.trigger(`notification-${userId}`, 'promo-added', `'${user.fullname}' added a new promo '${promo.title}' for ${course ? `'` + course.title + `'` : 'your college courses.'}.`);
            });
            unmudlUsers.forEach(userId => {
                notifications.push({
                    receiver: userId,
                    identifier: usersNotification_model_1.UserNotificationsIdentifiers.PROMO_ADDED,
                    type: usersNotification_model_1.UserNotificationTypes.ALERT,
                    promo: promo._id,
                    content: `'${user.fullname}' ${user.collegeId ? 'from ' + `'` + collegeId.title + `' ` : ''}added a new promo '${promo.title}' for ${course ? `'` + course.title + `'` : `'` + collegeId.title + `' courses`}.`,
                    user: user._id,
                });
                config_1.pusher.trigger(`notification-${userId}`, 'promo-added', `'${user.fullname}' ${user.collegeId ? 'from ' + `'` + collegeId.title + `' ` : ''}added a new promo '${promo.title}' for ${course ? `'` + course.title + `'` : `'` + collegeId.title + `' courses`}.`);
            });
            await this.createNotifications(notifications, null);
        }
        else {
            const notifications = [];
            const [users, user] = await Promise.all([
                this.getUsers(null, ['manager', 'admin', 'superadmin'], promo.addedBy),
                this.usersModel.findById(promo.addedBy, 'fullname'),
            ]);
            users.forEach(userId => {
                notifications.push({
                    receiver: userId,
                    identifier: usersNotification_model_1.UserNotificationsIdentifiers.PROMO_ADDED,
                    type: usersNotification_model_1.UserNotificationTypes.ALERT,
                    promo: promo._id,
                    content: `'${user.fullname}' added a new universal promo '${promo.title}'.`,
                    user: user._id,
                });
                config_1.pusher.trigger(`notification-${userId}`, 'promo-added', `'${user.fullname}' added a new universal promo '${promo.title}'`);
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
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.USER_JOINED,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content,
            });
        });
        await this.createNotifications(notifications, null);
        users.forEach(userId => {
            config_1.pusher.trigger(`notification-${userId}`, 'user-joined', content);
        });
    }
    async employerAdminJoined(employerAdmin) {
        const notifications = [];
        const employerAdmins = await this.getEmployerAdmins(employerAdmin.employerId, ['admin', 'superadmin'], employerAdmin._id);
        const content = `'${employerAdmin.fullname}' joined Unmudl as '${employerAdmin.role}'.`;
        employerAdmins.forEach(employerAdminId => {
            notifications.push({
                receiver: employerAdminId,
                identifier: employerAdminsNotification_model_1.EmployerAdminNotificationsIdentifiers.EMPLOYER_JOINED,
                type: employerAdminsNotification_model_1.EmployerAdminNotificationTypes.ALERT,
                content,
            });
        });
        await this.createNotifications(null, null, notifications);
        employerAdmins.forEach(employerAdminId => {
            config_1.pusher.trigger(`notification-${employerAdminId}`, 'employerAdmin-joined', content);
        });
    }
    async permissionLevelUpdated(modifiedUser, modifyingUser) {
        const notifications = [];
        const users = await this.getUsers(modifiedUser.collegeId, ['manager', 'admin', 'superadmin'], modifyingUser._id);
        users.forEach(userId => {
            notifications.push({
                receiver: userId,
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.PERMISSION_LEVEL,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content: `'${modifyingUser.fullname}' changed '${modifiedUser.fullname}' to '${modifiedUser.role}'.`,
                user: modifyingUser._id,
                modifiedUser: modifiedUser._id,
            });
        });
        await this.createNotifications(notifications, null);
        users.forEach(userId => {
            config_1.pusher.trigger(`notification-${userId}`, 'permission-level-changed', `'${modifyingUser.fullname}' changed '${modifiedUser.fullname}' to '${modifiedUser.role}'.`);
        });
    }
    async permissionLevelUpdatedForEmployer(modifiedAdmin, modifyingAdmin) {
        const notifications = [];
        const admins = await this.getEmployerAdmins(modifiedAdmin.collegeId, ['admin', 'superadmin'], modifyingAdmin._id);
        admins.forEach(adminId => {
            notifications.push({
                receiver: adminId,
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.PERMISSION_LEVEL,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content: `'${modifyingAdmin.fullname}' changed '${modifiedAdmin.fullname}' to '${modifiedAdmin.role}'.`,
                admin: modifyingAdmin._id,
                modifiedAdmin: modifiedAdmin._id,
            });
        });
        await this.createNotifications(null, null, notifications);
        admins.forEach(userId => {
            config_1.pusher.trigger(`notification-${userId}`, 'permission-level-changed', `'${modifyingAdmin.fullname}' changed '${modifiedAdmin.fullname}' to '${modifiedAdmin.role}'.`);
        });
    }
    async enrollmentStatusChanged(enrollment, course) {
        let content = '';
        if (enrollment.status === enrollmentStatus_enum_1.EnrollmentStatus.APPROVED ||
            enrollment.status === enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED ||
            enrollment.status === enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED) {
            content = `Your enrollment for course "${course.title}" has been approved.`;
        }
        else if (enrollment.status === enrollmentStatus_enum_1.EnrollmentStatus.DECLINED) {
            content = `Your enrollment for course "${course.title}" has been declined.`;
        }
        else if (enrollment.status === enrollmentStatus_enum_1.EnrollmentStatus.PENDING) {
            content = `Your enrollment request for course "${course.title}" has been received. The college will get back to you soon with a request for additional information or a decision on admission.`;
        }
        const notification = {
            receiver: enrollment.learnerId,
            identifier: learnersNotification_model_1.LearnerNotificationsIdentifiers.ENROLLMENT_STATUS,
            content,
            course: enrollment.courseId,
            enrollment: enrollment._id,
        };
        config_1.pusher.trigger(`notification-${enrollment.learnerId}`, 'enrollment-status', content);
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
            await this.learnerNotificationsModel.findOneAndUpdate({
                receiver: mongoose.Types.ObjectId(learner._id),
                chat: mongoose.Types.ObjectId(chat._id),
                identifier: learnersNotification_model_1.LearnerNotificationsIdentifiers.NEW_MESSAGE,
            }, {
                receiver: learner._id,
                from: from._id,
                fromType,
                identifier: learnersNotification_model_1.LearnerNotificationsIdentifiers.NEW_MESSAGE,
                chat: chat._id,
                chatModule: chat.module,
                chatMessage: message._id,
                isSeen: false,
                createdAt: new Date(),
                content: `You have received a new message from ${from.fullname}.`,
            }, { upsert: true });
            config_1.pusher.trigger(`notification-${learner._id}`, 'new-message', message);
        }
        chat.users.map(async (admin) => {
            if (!user || user._id.toString() !== admin._id.toString()) {
                await this.userNotificationsModel.findOneAndUpdate({
                    receiver: mongoose.Types.ObjectId(admin._id),
                    chat: mongoose.Types.ObjectId(chat._id),
                    identifier: usersNotification_model_1.UserNotificationsIdentifiers.NEW_MESSAGE,
                }, {
                    receiver: admin._id,
                    from: from._id,
                    fromType,
                    identifier: usersNotification_model_1.UserNotificationsIdentifiers.NEW_MESSAGE,
                    chat: chat._id,
                    chatModule: chat.module,
                    chatMessage: message._id,
                    isSeen: false,
                    createdAt: new Date(),
                    content: `You have received a new message from ${from.fullname}.`,
                    type: usersNotification_model_1.UserNotificationTypes.HELP_AND_SUPPORT,
                    user: from._id,
                }, { upsert: true });
                config_1.pusher.trigger(`notification-${admin._id}`, 'new-message', message);
            }
        });
        chat.employerAdmins.map(async (admin) => {
            if (!employerAdmin || employerAdmin._id.toString() !== admin._id.toString()) {
                await this.employerAdminNotificationsModel.findOneAndUpdate({
                    receiver: mongoose.Types.ObjectId(admin._id),
                    chat: mongoose.Types.ObjectId(chat._id),
                    identifier: employerAdminsNotification_model_1.EmployerAdminNotificationsIdentifiers.NEW_MESSAGE,
                }, {
                    receiver: admin._id,
                    from: from._id,
                    fromType,
                    identifier: employerAdminsNotification_model_1.EmployerAdminNotificationsIdentifiers.NEW_MESSAGE,
                    chat: chat._id,
                    chatModule: chat.module,
                    chatMessage: message._id,
                    isSeen: false,
                    createdAt: new Date(),
                    content: `You have received a new message from ${from.fullname}.`,
                    type: employerAdminsNotification_model_1.EmployerAdminNotificationTypes.HELP_AND_SUPPORT,
                    user: from._id,
                }, { upsert: true });
                config_1.pusher.trigger(`notification-${admin._id}`, 'new-message', message);
            }
        });
    }
    async newMessage(chatMessage) {
        const members = chatMessage.chatId.members.filter(member => member.toString() !== chatMessage.from._id.toString());
        const promises = members.map(member => {
            return this.userNotificationsModel.findOneAndUpdate({ receiver: mongoose.Types.ObjectId(member), chatGroup: mongoose.Types.ObjectId(chatMessage.chatId._id) }, {
                receiver: member,
                chatGroup: chatMessage.chatId._id,
                chatMessage: chatMessage._id,
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.NEW_MESSAGE,
                type: usersNotification_model_1.UserNotificationTypes.HELP_AND_SUPPORT,
                user: chatMessage.from._id,
                content: `You have received a new message from ${chatMessage.from.fullname}.`,
                createdAt: new Date(),
                isSeen: false,
            }, { new: true, upsert: true });
        });
        await Promise.all(promises);
        members.forEach(member => {
            config_1.pusher.trigger(`notification-${member}`, 'new-message', chatMessage);
        });
    }
    async newEnquiry(enquiryMessage) {
        if (enquiryMessage.learner) {
            const users = enquiryMessage.chat.users.length > 0
                ? enquiryMessage.chat.users
                : await this.getUsers(enquiryMessage.chat.course.collegeId, [user_model_1.UserRoles.SUPERADMIN, user_model_1.UserRoles.ADMIN], null);
            if (users.length > 0) {
                const promises = users.map(user => {
                    return this.userNotificationsModel.findOneAndUpdate({ receiver: mongoose.Types.ObjectId(user), enquiry: mongoose.Types.ObjectId(enquiryMessage.chat._id) }, {
                        receiver: user,
                        enquiry: enquiryMessage.chat._id,
                        enquiryMessage: enquiryMessage._id,
                        identifier: usersNotification_model_1.UserNotificationsIdentifiers.NEW_ENQUIRY,
                        type: usersNotification_model_1.UserNotificationTypes.HELP_AND_SUPPORT,
                        learner: enquiryMessage.learner._id,
                        content: `${enquiryMessage.learner.fullname} added a message in ${enquiryMessage.chat.course.title}'s inquiry.`,
                        createdAt: new Date(),
                        isSeen: false,
                    }, { new: true, upsert: true });
                });
                await Promise.all(promises);
                users.forEach(user => {
                    config_1.pusher.trigger(`notification-${user}`, 'new-enquiry', enquiryMessage);
                });
            }
        }
        else {
            const content = `${enquiryMessage.user.fullname} added a reply in ${enquiryMessage.chat.course.title}'s inquiry.`;
            await this.learnerNotificationsModel.findOneAndUpdate({ receiver: mongoose.Types.ObjectId(enquiryMessage.chat.learner), enquiry: mongoose.Types.ObjectId(enquiryMessage.chat._id) }, {
                receiver: enquiryMessage.chat.learner,
                enquiry: enquiryMessage.chat._id,
                enquiryMessage: enquiryMessage._id,
                identifier: learnersNotification_model_1.LearnerNotificationsIdentifiers.NEW_ENQUIRY,
                user: enquiryMessage.user._id,
                content,
                createdAt: new Date(),
                isSeen: false,
            }, { new: true, upsert: true });
            config_1.pusher.trigger(`notification-${enquiryMessage.chat.learner}`, 'new-enquiry', content);
            const users = enquiryMessage.chat.users.filter(user => user.toString() !== enquiryMessage.user._id.toString());
            if (users.length > 0) {
                const promises = users.map(user => {
                    return this.userNotificationsModel.findOneAndUpdate({ receiver: mongoose.Types.ObjectId(user), enquiry: mongoose.Types.ObjectId(enquiryMessage.chat._id) }, {
                        receiver: user,
                        enquiry: enquiryMessage.chat._id,
                        enquiryMessage: enquiryMessage._id,
                        identifier: usersNotification_model_1.UserNotificationsIdentifiers.NEW_ENQUIRY,
                        type: usersNotification_model_1.UserNotificationTypes.HELP_AND_SUPPORT,
                        learner: enquiryMessage.learner._id,
                        content: `${enquiryMessage.user.fullname} added a reply in ${enquiryMessage.chat.course.title}'s inquiry.`,
                        createdAt: new Date(),
                        isSeen: false,
                    }, { new: true, upsert: true });
                });
                await Promise.all(promises);
                users.forEach(user => {
                    config_1.pusher.trigger(`notification-${user}`, 'new-enquiry', enquiryMessage);
                });
            }
        }
    }
    async newGenericChat(chat) {
        const employerUser = chat.module === chatList_dto_1.ChatModuleEnum.SOURCE_TALENT && chat.employerAdmins.length > 0
            ? await this.employerAdminsModel
                .findById(chat.employerAdmins[0], 'employerId')
                .populate('employerId', 'title')
                .lean()
                .exec()
            : null;
        chat.employerAdmins.forEach(member => {
            if (chat.module !== chatList_dto_1.ChatModuleEnum.SOURCE_TALENT) {
                this.employerAdminNotificationsModel.create({
                    receiver: member,
                    chat: chat._id,
                    chatModule: chat.module,
                    identifier: employerAdminsNotification_model_1.EmployerAdminNotificationsIdentifiers.CREATED_CHAT,
                    type: employerAdminsNotification_model_1.EmployerAdminNotificationTypes.HELP_AND_SUPPORT,
                    content: chat.createdBy.toString() === member.toString() ? `You just created a chat.` : `You were just added in a chat.`,
                });
            }
        });
        chat.users.forEach(member => {
            this.userNotificationsModel.create({
                receiver: member,
                chat: chat._id,
                chatModule: chat.module,
                identifier: chat.module === chatList_dto_1.ChatModuleEnum.SOURCE_TALENT
                    ? usersNotification_model_1.UserNotificationsIdentifiers.SOURCE_TALENT_REQUEST
                    : usersNotification_model_1.UserNotificationsIdentifiers.CREATED_CHAT,
                type: chat.module === chatList_dto_1.ChatModuleEnum.SOURCE_TALENT ? usersNotification_model_1.UserNotificationTypes.ALERT : usersNotification_model_1.UserNotificationTypes.HELP_AND_SUPPORT,
                content: chat.createdBy.toString() === member.toString()
                    ? `You just created a chat.`
                    : chat.module === chatList_dto_1.ChatModuleEnum.SOURCE_TALENT
                        ? `You have received a source talent request from '${employerUser.employerId.title}'.`
                        : `You were just added in a chat.`,
            });
        });
        if (chat.learner) {
            this.learnerNotificationsModel.create({
                receiver: chat.learner,
                chat: chat._id,
                chatModule: chat.module,
                identifier: chat.module === chatList_dto_1.ChatModuleEnum.SOURCE_TALENT
                    ? learnersNotification_model_1.LearnerNotificationsIdentifiers.SOURCE_TALENT_REQUEST
                    : learnersNotification_model_1.LearnerNotificationsIdentifiers.CREATED_CHAT,
                content: chat.createdBy.toString() === chat.learner.toString()
                    ? `You just created a chat.`
                    : chat.module === chatList_dto_1.ChatModuleEnum.SOURCE_TALENT
                        ? `You have received a source talent request from '${employerUser.employerId.title}'.`
                        : `You were just added in a chat.`,
            });
        }
    }
    async newMembersInChat(chat, { users, learner, employerAdmins }) {
        if (employerAdmins && employerAdmins.length > 0) {
            users.forEach(member => {
                this.employerAdminNotificationsModel.create({
                    receiver: member,
                    chat: chat._id,
                    chatModule: chat.module,
                    identifier: employerAdminsNotification_model_1.EmployerAdminNotificationsIdentifiers.NEW_CHAT,
                    type: employerAdminsNotification_model_1.EmployerAdminNotificationTypes.HELP_AND_SUPPORT,
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
                    identifier: usersNotification_model_1.UserNotificationsIdentifiers.NEW_CHAT,
                    type: usersNotification_model_1.UserNotificationTypes.HELP_AND_SUPPORT,
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
                identifier: learnersNotification_model_1.LearnerNotificationsIdentifiers.NEW_CHAT,
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
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.NEW_CHAT,
                type: usersNotification_model_1.UserNotificationTypes.HELP_AND_SUPPORT,
                user: chat.createdBy._id,
                content: `You are added in a chat created by ${chat.createdBy.fullname}.`,
            });
        });
        await this.createNotifications(notifications, null);
        members.forEach(member => {
            config_1.pusher.trigger(`notification-${member}`, 'new-chat', chat);
        });
    }
    async refundRequest(refundRequest) {
        let content = '';
        const course = await this.getCourseTitle(refundRequest.courseId);
        if ([createRefund_enum_1.RefundStatus.REFUNDED, createRefund_enum_1.RefundStatus.REJECTED].includes(refundRequest.status)) {
            if (refundRequest.status === createRefund_enum_1.RefundStatus.REFUNDED) {
                content = `Your refund request for course "${course.title}" has been approved.`;
            }
            else if (refundRequest.status === createRefund_enum_1.RefundStatus.REJECTED) {
                content = `Your refund request for course "${course.title}" has been declined.`;
            }
            const notification = {
                receiver: refundRequest.learnerId,
                identifier: learnersNotification_model_1.LearnerNotificationsIdentifiers.REFUND_REQUEST,
                content,
                course: refundRequest.courseId,
                enrollment: refundRequest.enrollmentId,
                status: refundRequest.status,
            };
            await this.createNotifications(null, [notification]);
            config_1.pusher.trigger(`notification-${refundRequest.learnerId}`, 'refund-request', content);
        }
        else if (refundRequest.status === createRefund_enum_1.RefundStatus.PENDING) {
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
                    identifier: usersNotification_model_1.UserNotificationsIdentifiers.REFUND_REQUEST,
                    type: usersNotification_model_1.UserNotificationTypes.ALERT,
                    status: refundRequest.status,
                    content,
                });
                config_1.pusher.trigger(`notification-${userId}`, 'refund-request', content);
            });
            unmudlUsers.forEach(userId => {
                notifications.push({
                    receiver: userId,
                    learner: refundRequest.learnerId,
                    identifier: usersNotification_model_1.UserNotificationsIdentifiers.REFUND_REQUEST,
                    type: usersNotification_model_1.UserNotificationTypes.ALERT,
                    status: refundRequest.status,
                    content,
                });
                config_1.pusher.trigger(`notification-${userId}`, 'refund-request', content);
            });
            await this.createNotifications(notifications, null);
        }
    }
    async reviewReported(report) {
        const course = await this.getCourseByReview(report.reviewId);
        const content = `Your review on course "${course.title}" has been removed with a warning.`;
        const notification = {
            receiver: report.reportedLearnerId,
            identifier: learnersNotification_model_1.LearnerNotificationsIdentifiers.REVIEW_REPORTED,
            content,
            course: course._id,
        };
        config_1.pusher.trigger(`notification-${report.reportedLearnerId}`, 'review-reported', content);
        await this.createNotifications(null, [notification]);
        config_1.pusher.trigger(`notification-cadmins-${report.reportedLearnerId}`, 'review-request', notification);
    }
    async courseAdded(course, user) {
        const notifications = [];
        if (course.instructorIds && course.instructorIds[0]) {
            notifications.push({
                receiver: course.instructorIds[0],
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.COURSE_ADDED,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content: `'${user.fullname}' added you as an instructor on '${course.title}'.`,
                course: course._id,
                user: user._id,
            });
            config_1.pusher.trigger(`notification-${course.instructorIds[0]}`, 'course-added', `'${user.fullname}' added you as an instructor on '${course.title}'.`);
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
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.COURSE_ADDED,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content: `'${user.fullname}' added a new course '${course.title}'.`,
                course: course._id,
                user: user._id,
            });
            config_1.pusher.trigger(`notification-${userId}`, 'course-added', `'${user.fullname}' added a new course '${course.title}'.`);
        });
        unmudlUsers.forEach(userId => {
            notifications.push({
                receiver: userId,
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.COURSE_ADDED,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content: `'${user.fullname}' from '${collegeId.title}' added a new course '${course.title}'.`,
                course: course._id,
                user: user._id,
            });
            config_1.pusher.trigger(`notification-${userId}`, 'course-added', `'${user.fullname}' from '${collegeId.title}' added a new course '${course.title}'.`);
        });
        await this.createNotifications(notifications, null);
    }
    async courseEdited(course, user) {
        const notifications = [];
        if (course.instructorIds && course.instructorIds.length > 0 && user._id && course.instructorIds[0].toString() !== user._id.toString()) {
            notifications.push({
                receiver: course.instructorIds[0],
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.COURSE_EDITED,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content: `'${user.fullname}' edited your course '${course.title}'.`,
                course: course._id,
                user: user._id,
            });
            config_1.pusher.trigger(`notification-${course.instructorIds[0]}`, 'course-edited', `'${user.fullname}' edited your course '${course.title}'.`);
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
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.COURSE_EDITED,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content: `'${user.fullname}' edited the course '${course.title}'.`,
                course: course._id,
                user: user._id,
            });
            config_1.pusher.trigger(`notification-${userId}`, 'course-edited', `'${user.fullname}' edited the course '${course.title}'.`);
        });
        unmudlUsers.forEach(userId => {
            notifications.push({
                receiver: userId,
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.COURSE_EDITED,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content: `'${user.fullname}' from '${collegeId.title}' edited the course '${course.title}'.`,
                course: course._id,
                user: user._id,
            });
            config_1.pusher.trigger(`notification-${userId}`, 'course-edited', `'${user.fullname}' from '${collegeId.title}' edited the course '${course.title}'.`);
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
                identifier: learnersNotification_model_1.LearnerNotificationsIdentifiers.RELATED_COURSE,
                content: `Check out the new course "${course.title}" added on UNMUDL.`,
                course: course._id,
            });
            config_1.pusher.trigger(`notification-uadmins-${learner}`, 'related-course-add', `Check out the new course "${course.title}" added on UNMUDL.`);
        });
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
            identifier: usersNotification_model_1.UserNotificationsIdentifiers.COLLEGE_JOINED,
            type: usersNotification_model_1.UserNotificationTypes.ALERT,
            content: `'${college.title}' joined UNMUDL on your request.`,
            user: invitedBy,
            college: college._id,
        });
        users.forEach(userId => {
            notifications.push({
                receiver: userId,
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.COLLEGE_JOINED,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content: `'${college.title}' joined UNMUDL on "${invitingUser.fullname}'s" request.`,
                user: invitedBy,
                college: college._id,
            });
        });
        await this.createNotifications(notifications, null);
        users.forEach(userId => {
            config_1.pusher.trigger(`notification-${userId}`, 'college-joined', `'${college.title}' joined UNMUDL on "${invitingUser.fullname}'s" request.`);
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
            identifier: usersNotification_model_1.UserNotificationsIdentifiers.EMPLOYER_JOINED,
            type: usersNotification_model_1.UserNotificationTypes.ALERT,
            content: `'${employer.title}' joined UNMUDL on your request.`,
            user: invitedBy,
            employerCompany: employer._id,
        });
        users.forEach(userId => {
            notifications.push({
                receiver: userId,
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.EMPLOYER_JOINED,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content: `'${employer.title}' joined UNMUDL on "${invitingUser.fullname}'s" request.`,
                user: invitedBy,
                employerCompany: employer._id,
            });
        });
        await this.createNotifications(notifications, null);
        users.forEach(userId => {
            config_1.pusher.trigger(`notification-${userId}`, 'employer-joined', `'${employer.title}' joined UNMUDL on "${invitingUser.fullname}'s" request.`);
        });
    }
    async blogStatusChanged(blog, updatingUser) {
        const notifications = [];
        notifications.push({
            receiver: blog.author,
            identifier: usersNotification_model_1.UserNotificationsIdentifiers.BLOG_STATUS,
            type: usersNotification_model_1.UserNotificationTypes.ALERT,
            content: `Your blog post "${blog.title}" was ${blog.status !== createBlog_enum_1.BlogStatus.PUBLISHED ? 'denied' : 'accepted for publication'} by Unmudl's reviewer.`,
            user: updatingUser,
        });
        config_1.pusher.trigger(`notification-${blog.author}`, 'blog-status-updated', notifications[0].content);
        await this.createNotifications(notifications, null);
    }
    async getCourseTitle(courseId) {
        return await this.coursesModel.findById(courseId, 'title collegeId').lean();
    }
    async getCourseByReview(reviewId) {
        return await this.coursesModel.findOne({ 'reviews._id': mongoose.Types.ObjectId(reviewId) }, 'title').lean();
    }
    async getRelatedCoursesEnrollments(course) {
        const relatedCourses = course.relatedCourses;
        const enrolledStatuses = [enrollmentStatus_enum_1.EnrollmentStatus.APPROVED, enrollmentStatus_enum_1.EnrollmentStatus.PENDING, enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED];
        return await this.enrollmentsModel
            .find({
            courseId: { $in: relatedCourses },
            status: { $in: enrolledStatuses },
        })
            .lean();
    }
    async getUsers(collegeId, roles, ignore) {
        const find = { collegeId, role: { $in: roles } };
        if (ignore) {
            find._id = { $ne: mongoose.Types.ObjectId(ignore) };
        }
        const users = await this.usersModel
            .find(find, '_id')
            .lean()
            .exec();
        return users.length > 0 ? users.map(user => user._id) : [];
    }
    async getEmployerAdmins(employerId, roles, ignore) {
        const find = { employerId, role: { $in: roles } };
        if (ignore) {
            find._id = { $ne: mongoose.Types.ObjectId(ignore) };
        }
        const employers = await this.employerAdminsModel
            .find(find, '_id')
            .lean()
            .exec();
        return employers.length > 0 ? employers.map(employer => employer._id) : [];
    }
    async getUserMails(collegeId, roles, ignore) {
        const find = { collegeId, role: { $in: roles }, 'notifications.email': true };
        if (ignore) {
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
                status: courses_model_1.CourseStatus.LIVE,
                enrollmentDeadline: {
                    $gte: new Date(moment()
                        .add(2, 'day')
                        .startOf('day')
                        .toISOString()),
                    $lt: new Date(moment()
                        .add(3, 'day')
                        .startOf('day')
                        .toISOString()),
                },
            }
            : {
                unpublishedDate: null,
                status: { $nin: [courses_model_1.CourseStatus.CANCELED, courses_model_1.CourseStatus.COMING_SOON] },
                enrollmentDeadline: {
                    $gte: new Date(moment()
                        .add(2, 'day')
                        .startOf('day')
                        .toISOString()),
                    $lt: new Date(moment()
                        .add(3, 'day')
                        .startOf('day')
                        .toISOString()),
                },
            };
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
                                        { $in: ['$role', [user_model_1.UserRoles.SUPERADMIN, user_model_1.UserRoles.ADMIN]] },
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
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.ADMIN) : null;
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
        return ResponseHandler_1.default.success({ activities, rows });
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
        return ResponseHandler_1.default.success({ activities, rows });
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
        return ResponseHandler_1.default.success({ activities, rows });
    }
    async newProposal(proposal) {
        const [users, employerUser] = await Promise.all([
            this.getUsers(proposal.visibility !== 'all' ? { $in: proposal.colleges } : { $ne: null }, [user_model_1.UserRoles.ADMIN, user_model_1.UserRoles.SUPERADMIN]),
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
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.NEW_PROPOSAL,
                type: usersNotification_model_1.UserNotificationTypes.ALERT,
                content: `You have just received a new proposal from '${employerUser.employerId.title}'.`,
            });
            config_1.pusher.trigger(`notification-${userId}`, 'new-proposal', proposal);
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
                identifier: employerAdminsNotification_model_1.EmployerAdminNotificationsIdentifiers.PROPOSAL_RESPONSE,
                type: employerAdminsNotification_model_1.EmployerAdminNotificationTypes.ALERT,
                chat: proposalResponse.chat,
                content: `You have just received a new response to your proposal '${proposalResponse.proposal.title}'.`,
            });
            config_1.pusher.trigger(`notification-${userId._id}`, 'new-proposal-response', proposalResponse);
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
                identifier: employerAdminsNotification_model_1.EmployerAdminNotificationsIdentifiers.FORUM_POST,
                type: employerAdminsNotification_model_1.EmployerAdminNotificationTypes.ALERT,
                forumPost: post._id,
                content: `${post.user ? post.user.fullname : post.employerAdmin.fullname} posted a new topic '${post.topic}'.`,
            });
            userNotifications.push({
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.EMPLOYER_FORUM_POST,
                type: employerAdminsNotification_model_1.EmployerAdminNotificationTypes.ALERT,
                forumPost: post._id,
                content: `${post.user ? post.user.fullname : post.employerAdmin.fullname} posted a new topic '${post.topic}'.`,
            });
            await this.createNotifications(userNotifications, null, notifications);
        }
        catch (err) {
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
                    identifier: employerAdminsNotification_model_1.EmployerAdminNotificationsIdentifiers.FORUM_COMMENT,
                    type: employerAdminsNotification_model_1.EmployerAdminNotificationTypes.ALERT,
                    forumPost: comment.employerPost._id,
                    forumComment: comment._id,
                    content: `${comment.user ? comment.user.fullname : comment.employerAdmin.fullname} replied to your topic '${comment.employerPost.topic}'.`,
                });
                config_1.pusher.trigger(`notification-${comment.employerPost.employerAdmin}`, 'new-forum-comment', comment);
                await this.createNotifications(null, null, notifications);
            }
            else {
                const notifications = [];
                notifications.push({
                    receiver: comment.employerPost.user,
                    identifier: usersNotification_model_1.UserNotificationsIdentifiers.EMPLOYER_FORUM_COMMENT,
                    type: usersNotification_model_1.UserNotificationTypes.ALERT,
                    employerForumPost: comment.employerPost._id,
                    employerForumComment: comment._id,
                    content: `${comment.user ? comment.user.fullname : comment.employerAdmin.fullname} replied to your topic '${comment.employerPost.topic}'.`,
                });
                config_1.pusher.trigger(`notification-${comment.employerPost.user}`, 'new-forum-comment', comment);
                await this.createNotifications(notifications, null, null);
            }
        }
        catch (err) {
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
                    identifier: employerAdminsNotification_model_1.EmployerAdminNotificationsIdentifiers.FORUM_REPLY,
                    type: employerAdminsNotification_model_1.EmployerAdminNotificationTypes.ALERT,
                    forumPost: reply.employerComment.employerPost._id,
                    forumComment: reply.employerComment._id,
                    forumReply: reply._id,
                    content: `${reply.user ? reply.user.fullname : reply.employerAdmin.fullname} replied to your comment on topic '${reply.employerComment.employerPost.topic}'.`,
                });
                config_1.pusher.trigger(`notification-${reply.employerComment.employerPost.employerAdmin}`, 'new-forum-reply', reply);
                await this.createNotifications(null, null, notifications);
            }
            else {
                const notifications = [];
                notifications.push({
                    receiver: reply.employerComment.employerPost.user,
                    identifier: usersNotification_model_1.UserNotificationsIdentifiers.EMPLOYER_FORUM_REPLY,
                    type: usersNotification_model_1.UserNotificationTypes.ALERT,
                    employerForumPost: reply.employerComment.employerPost._id,
                    employerForumComment: reply.employerComment._id,
                    employerForumReply: reply._id,
                    content: `${reply.user ? reply.user.fullname : reply.employerAdmin.fullname} replied to your comment on topic '${reply.employerComment.employerPost.topic}'.`,
                });
                config_1.pusher.trigger(`notification-${reply.employerComment.employerPost.user}`, 'new-forum-reply', reply);
                await this.createNotifications(notifications, null, null);
            }
        }
        catch (err) {
            console.log(err);
            return true;
        }
    }
    async unmudlUserDailyPerformance() {
        const [users, newEnrollment, revenueData] = await Promise.all([
            this.getUsers(null, ['manager', 'admin', 'superadmin']),
            this.enrollmentsModel.countDocuments({
                createdAt: {
                    $lt: new Date(),
                    $gte: new Date(moment()
                        .subtract(1, 'day')
                        .toISOString()),
                },
            }),
            this.enrollmentsModel.aggregate([
                {
                    $match: {
                        status: { $in: [enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED, enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED] },
                        updatedAt: {
                            $lt: new Date(),
                            $gte: new Date(moment()
                                .subtract(1, 'day')
                                .toISOString()),
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
                identifier: usersNotification_model_1.UserNotificationsIdentifiers.DAILY_ENROLLMENTS,
                type: usersNotification_model_1.UserNotificationTypes.SALES,
                content: `${newEnrollment} new enrollments added on Unmudl in the last 24 hours.`,
            });
            if (revenue) {
                notifications.push({
                    receiver: userId,
                    identifier: usersNotification_model_1.UserNotificationsIdentifiers.DAILY_REVENUE,
                    type: usersNotification_model_1.UserNotificationTypes.SALES,
                    content: `Total revenue for last 24 hours was $${revenue.totalRevenue.toFixed(2)} and Unmudl revenue was $
          ${revenue.unmudlRevenue.toFixed(2)}.`,
                });
            }
        });
        await this.createNotifications(notifications, null);
    }
    async CollegeDailyNotifications() {
        const [courseDeadlineNotifications, enrollmentClosedNotifications, newEnrollmentNotifications, revenueNotifications,] = await Promise.all([
            this.coursesModel.aggregate([
                {
                    $match: {
                        enrollmentDeadline: {
                            $gt: new Date(),
                            $lte: new Date(moment()
                                .add(7, 'day')
                                .toISOString()),
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
                        identifier: usersNotification_model_1.UserNotificationsIdentifiers.COURSE_DEADLINE,
                        type: usersNotification_model_1.UserNotificationTypes.ALERT,
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
                            $gte: new Date(moment()
                                .subtract(1, 'day')
                                .toISOString()),
                        },
                        instructorIds: { $size: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        receiver: { $arrayElemAt: ['$instructorIds', 0] },
                        identifier: usersNotification_model_1.UserNotificationsIdentifiers.ENROLLMENT_CLOSED,
                        type: usersNotification_model_1.UserNotificationTypes.ALERT,
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
                            $gte: new Date(moment()
                                .subtract(1, 'day')
                                .toISOString()),
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
                                            { $in: ['$role', [user_model_1.UserRoles.SUPERADMIN, user_model_1.UserRoles.ADMIN, user_model_1.UserRoles.MANAGER]] },
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
                        identifier: usersNotification_model_1.UserNotificationsIdentifiers.DAILY_ENROLLMENTS,
                        type: usersNotification_model_1.UserNotificationTypes.SALES,
                        content: { $concat: [{ $toString: '$newEnrollments' }, ' learners enrolled in your courses in last 24 hours'] },
                    },
                },
            ]),
            this.enrollmentsModel.aggregate([
                {
                    $match: {
                        updatedAt: {
                            $lt: new Date(),
                            $gte: new Date(moment()
                                .subtract(1, 'day')
                                .toISOString()),
                        },
                        status: { $in: [enrollmentStatus_enum_1.EnrollmentStatus.PROCESSED, enrollmentStatus_enum_1.EnrollmentStatus.TRANSFERRED] },
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
                                            { $in: ['$role', [user_model_1.UserRoles.SUPERADMIN, user_model_1.UserRoles.ADMIN, user_model_1.UserRoles.MANAGER]] },
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
                        identifier: usersNotification_model_1.UserNotificationsIdentifiers.DAILY_REVENUE,
                        type: usersNotification_model_1.UserNotificationTypes.SALES,
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
                        $lte: new Date(moment()
                            .add(1, 'day')
                            .toISOString()),
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    receiver: '$_id',
                    identifier: learnersNotification_model_1.LearnerNotificationsIdentifiers.ENROLLMENT_DEADLINE,
                    content: { $concat: ['The deadline for course ', '$course.title', ' ends in 1 day.'] },
                    course: '$course._id',
                },
            },
        ]);
        if (learnerEnrollmentDeadlineNotifications && learnerEnrollmentDeadlineNotifications.length > 0) {
            await this.createNotifications(null, learnerEnrollmentDeadlineNotifications);
        }
    }
    async AdminEnrollmentDeadlineNotificationsCron() {
        await this.adminEnrollmentDeadlineNotifications();
    }
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
            .find({
            invitation: { $ne: 'pending' },
            collegeId: null,
            role: { $in: [user_model_1.UserRoles.SUPERADMIN, user_model_1.UserRoles.ADMIN] },
            'notifications.email': true,
        }, 'emailAddress')
            .lean()
            .exec();
        if (!landingPageData.hideFeatured) {
            landingPageData.featured.map(course => {
                if (moment(course.enrollmentDeadline).isSameOrAfter(moment()
                    .add(1, 'day')
                    .startOf('day')) &&
                    moment(course.enrollmentDeadline).isBefore(moment()
                        .add(2, 'day')
                        .startOf('day'))) {
                    courses.push(course);
                }
            });
        }
        if (!landingPageData.hideHighlyRated) {
            landingPageData.highlyRated.map(course => {
                if (moment(course.enrollmentDeadline).isSameOrAfter(moment()
                    .add(1, 'day')
                    .startOf('day')) &&
                    moment(course.enrollmentDeadline).isBefore(moment()
                        .add(2, 'day')
                        .startOf('day'))) {
                    courses.push(course);
                }
            });
        }
        if (!landingPageData.hideCredentialCourses) {
            landingPageData.credentialCourses.map(course => {
                if (moment(course.enrollmentDeadline).isSameOrAfter(moment()
                    .add(1, 'day')
                    .startOf('day')) &&
                    moment(course.enrollmentDeadline).isBefore(moment()
                        .add(2, 'day')
                        .startOf('day'))) {
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
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.LEARNER) : null;
                }, 1000);
            }
        }
        return true;
    }
};
__decorate([
    schedule_1.Cron('0 0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "unmudlUserDailyPerformance", null);
__decorate([
    schedule_1.Cron('0 0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "CollegeDailyNotifications", null);
__decorate([
    schedule_1.Cron('0 0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "LearnerEnrollmentDeadlineNotifications", null);
__decorate([
    schedule_1.Cron('0 0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "AdminEnrollmentDeadlineNotificationsCron", null);
__decorate([
    schedule_1.Cron('0 0 0 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "AdminLandingPageEnrollmentDeadlineNotificationsCron", null);
NotificationsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('user-notifications')),
    __param(1, mongoose_1.InjectModel('learner-notifications')),
    __param(2, mongoose_1.InjectModel('employer-admin-notifications')),
    __param(3, mongoose_1.InjectModel('courses')),
    __param(4, mongoose_1.InjectModel('enrollments')),
    __param(5, mongoose_1.InjectModel('users')),
    __param(6, mongoose_1.InjectModel('learners')),
    __param(7, mongoose_1.InjectModel('employer-admins')),
    __param(8, mongoose_1.InjectModel('landing-page')),
    __param(9, mongoose_1.InjectModel('employer-replies')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, mailer_1.MailerService,
        email_logs_service_1.EmailLogsService])
], NotificationsService);
exports.NotificationsService = NotificationsService;
//# sourceMappingURL=notifications.service.js.map