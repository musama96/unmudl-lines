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
const config_1 = require("../config/config");
const notifications_service_1 = require("../notifications/notifications.service");
const mailer_1 = require("@nest-modules/mailer");
const ResponseHandler_1 = require("../common/ResponseHandler");
const mongoose = require("mongoose");
const moment = require("moment");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const email_logs_service_1 = require("../email-logs/email-logs.service");
let EmployerEnquiriesService = class EmployerEnquiriesService {
    constructor(employerEnquiryModel, employerEnquiryMessagesModel, employerAdminModel, collegeModel, userModel, notificationsService, mailerService, emailLogsService) {
        this.employerEnquiryModel = employerEnquiryModel;
        this.employerEnquiryMessagesModel = employerEnquiryMessagesModel;
        this.employerAdminModel = employerAdminModel;
        this.collegeModel = collegeModel;
        this.userModel = userModel;
        this.notificationsService = notificationsService;
        this.mailerService = mailerService;
        this.emailLogsService = emailLogsService;
    }
    async addEmployerEnquiryMessage(enquiryData) {
        const { employerAdminId, collegeId, message } = enquiryData;
        const find = {
            employerAdmin: mongoose.Types.ObjectId(employerAdminId),
        };
        if (collegeId) {
            find.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        const [enquiry, employerAdmin] = await Promise.all([
            this.employerEnquiryModel
                .findOne(find)
                .lean()
                .exec(),
            this.employerAdminModel
                .findById(employerAdminId, 'fullname')
                .lean()
                .exec(),
        ]);
        if (enquiry) {
            const enquiryMessage = await this.employerEnquiryMessagesModel.create({
                enquiry: enquiry._id,
                message,
                employerAdmin: employerAdmin._id,
            });
            await enquiryMessage
                .populate('employerAdmin', 'fullname profilePhoto profilePhotoThumbnail')
                .populate({ path: 'enquiry' })
                .execPopulate();
            (async () => await this.notificationsService.newEnquiry(enquiryMessage))();
            config_1.pusher.trigger(`employer${collegeId ? '-college' : '-unmudl'}-enquiry-message-${enquiry._id}`, `employer${collegeId ? '-college' : '-unmudl'}-new-message`, enquiryMessage);
            return ResponseHandler_1.default.success({ enquiry, message: enquiryMessage });
        }
        else {
            const newEnquiry = await this.employerEnquiryModel.create({
                employerAdmin,
                college: collegeId ? collegeId : null,
                type: collegeId ? 'college' : 'unmudl',
            });
            await newEnquiry
                .populate('employerAdmin', 'fullname profilePhoto profilePhotoThumbnail')
                .populate('course', 'title coverPhoto coverPhotoThumbnail')
                .execPopulate();
            let admins = [];
            if (collegeId) {
                admins = await this.userModel
                    .aggregate([
                    {
                        $match: {
                            collegeId: mongoose.Types.ObjectId(collegeId),
                            role: { $in: ['superadmin', 'admin'] },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            role: 1,
                            emailAddress: 1,
                            notifications: 1,
                        },
                    },
                ])
                    .exec();
            }
            let superAdmin = null;
            const superAdminArray = [];
            admins.forEach(admin => {
                config_1.pusher.trigger(`new-employer${collegeId ? '-college' : '-unmudl'}-enquiry-group-${admin._id}`, `new-employer${collegeId ? '-college' : '-unmudl'}-enquiry-group`, newEnquiry);
                if (admin.role !== 'admin' && admin.notifications.email) {
                    superAdmin = admin._id;
                    superAdminArray.push(admin);
                }
            });
            const enquiryMessage = await this.employerEnquiryMessagesModel.create({
                enquiry: newEnquiry._id,
                message,
                employerAdmin,
            });
            const replyMessage = await this.employerEnquiryMessagesModel.create({
                enquiry: newEnquiry._id,
                message: `Thank you for contacting us we will get back to you within 1 day.`,
                user: superAdmin,
            });
            await Promise.all([
                enquiryMessage.populate('learner', 'fullname profilePhoto profilePhotoThumbnail').execPopulate(),
                replyMessage.populate('user', 'fullname profilePhoto profilePhotoThumbnail').execPopulate(),
            ]);
            const mailData = {
                to: process.env.SUPPORT_MAIL,
                from: process.env.ADMIN_NOTIFICATION_FROM,
                subject: 'UNMUDL Employer Enquiry',
                template: 'adminEmployerEnquiry',
                context: {
                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                    date: moment(new Date()).format('LL'),
                    employerAdmin,
                },
            };
            const mail = await this.mailerService.sendMail(mailData);
            mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.EMPLOYER) : null;
            for (let i = 0; i < superAdminArray.length; i++) {
                setTimeout(async () => {
                    const mailData = {
                        to: superAdminArray[i].emailAddress,
                        from: process.env.ADMIN_NOTIFICATION_FROM,
                        subject: 'UNMUDL Notification',
                        template: 'adminEmployerEnquiry',
                        context: {
                            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                            date: moment(new Date()).format('LL'),
                            employerAdmin,
                        },
                    };
                    const mail = await this.mailerService.sendMail(mailData);
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.EMPLOYER) : null;
                }, 1000);
            }
            return ResponseHandler_1.default.success({ enquiry: newEnquiry, message: enquiryMessage, reply: replyMessage });
        }
    }
    async getUserEnquiries(user) {
        const enquiries = await this.employerEnquiryModel.aggregate([
            { $match: { users: mongoose.Types.ObjectId(user._id) } },
            {
                $lookup: {
                    from: 'employer-admins',
                    localField: 'employerAdmin',
                    foreignField: '_id',
                    as: 'employerAdmin',
                },
            },
            {
                $lookup: {
                    from: 'enquiry-messages',
                    let: { enquiryId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$enquiry', '$$enquiryId'] }] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                        {
                            $project: {
                                message: 1,
                                hasUnreadMessages: {
                                    $cond: [
                                        { $gt: [{ $size: { $setIntersection: ['$readByUsers', [mongoose.Types.ObjectId(user._id)]] } }, 0] },
                                        false,
                                        true,
                                    ],
                                },
                                createdAt: 1,
                            },
                        },
                    ],
                    as: 'recentMessage',
                },
            },
            { $unwind: { path: '$employerAdmin', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$recentMessage', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    'employerAdmin.fullname': 1,
                    'employerAdmin.profilePhoto': 1,
                    'employerAdmin.profilePhotoThumbnail': 1,
                    hasUnreadMessages: '$recentMessage.hasUnreadMessages',
                    recentMessage: 1,
                    createdAt: 1,
                },
            },
            { $sort: { 'recentMessage.createdAt': -1, createdAt: -1 } },
        ]);
        return ResponseHandler_1.default.success(enquiries);
    }
    async getEnquiryMessages(params) {
        const { enquiry, page, perPage, userId, employerAdminId, isAdmin } = params;
        const find = employerAdminId
            ? { _id: mongoose.Types.ObjectId(enquiry), employerAdmin: mongoose.Types.ObjectId(employerAdminId) }
            : isAdmin
                ? { _id: mongoose.Types.ObjectId(enquiry) }
                : { _id: mongoose.Types.ObjectId(enquiry), users: mongoose.Types.ObjectId(userId) };
        const enquiryExist = await this.employerEnquiryModel
            .findOne(find)
            .populate('employerAdmin', 'fullname profilePhoto profilePhotoThumbnail')
            .populate('users', 'fullname profilePhoto profilePhotoThumbnail')
            .lean()
            .exec();
        if (!enquiryExist) {
            return ResponseHandler_1.default.fail('You are not part of this enquiry.');
        }
        const messages = await this.employerEnquiryMessagesModel
            .find({ enquiry: mongoose.Types.ObjectId(enquiry) })
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('employerAdmin', 'fullname profilePhoto profilePhotoThumbnail')
            .populate('users', 'fullname profilePhoto profilePhotoThumbnail')
            .lean()
            .exec();
        const messageIds = messages.map(message => message._id);
        if (employerAdminId) {
            await this.employerEnquiryMessagesModel.updateMany({ _id: { $in: messageIds } }, { readByEmployerAdmin: true }, { multi: true, upsert: false });
        }
        else {
            await this.employerEnquiryMessagesModel.updateMany({ _id: { $in: messageIds } }, { $addToSet: { readByUsers: userId } }, { multi: true, upsert: false });
        }
        return ResponseHandler_1.default.success({ messages, chatGroup: enquiryExist });
    }
    async addUserEnquiry(userEnquiry, user) {
        const { enquiryGroupId, message } = userEnquiry;
        const enquiry = await this.employerEnquiryModel.findById(enquiryGroupId).exec();
        if (!enquiry) {
            return ResponseHandler_1.default.fail('Invalid enquiry Id.');
        }
        if (!user.role.includes('admin') && !enquiry.users.includes(user._id.toString())) {
            return ResponseHandler_1.default.fail('You are not part of this enquiry.');
        }
        if (!enquiry.users.includes(user._id.toString())) {
            enquiry.users.push(user._id);
            await enquiry.save();
        }
        const enquiryMessage = await this.employerEnquiryMessagesModel.create({
            enquiry: enquiry._id,
            message,
            readByEmployerAdmin: false,
            readByUsers: [user._id],
            users: [user._id],
        });
        await enquiryMessage
            .populate('users', 'fullname profilePhoto profilePhotoThumbnail')
            .populate({ path: 'enquiry' })
            .execPopulate();
        (async () => await this.notificationsService.newEnquiry(enquiryMessage))();
        config_1.pusher.trigger(`enquiry-message-${enquiry._id}`, 'new-message', enquiryMessage);
        return ResponseHandler_1.default.success({ message: enquiryMessage });
    }
    async addMembers(addMembers) {
        const { enquiryGroupId, users } = addMembers;
        const enquiry = await this.employerEnquiryModel
            .findById(enquiryGroupId)
            .lean()
            .exec();
        if (!enquiry) {
            return ResponseHandler_1.default.fail('Invalid enquiry Id.');
        }
        const updatedEnquiry = await this.employerEnquiryModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(enquiryGroupId) }, { $addToSet: { users: { $each: users } } }, { new: true, upsert: false });
        await updatedEnquiry.populate('employerAdmin', 'fullname profilePhoto profilePhotoThumbnail').execPopulate();
        users.forEach(userId => {
            config_1.pusher.trigger(`new-enquiry-group-${userId}`, 'added-in-enquiry-group', updatedEnquiry);
        });
        return ResponseHandler_1.default.success(enquiry, 'Members added successfully.');
    }
    async updateReadBy(updateMessage) {
        const { messageId, userId } = updateMessage;
        const enquiry = await this.employerEnquiryMessagesModel
            .findByIdAndUpdate(messageId, userId ? { $addToSet: { readByUsers: userId } } : { readByEmployerAdmin: true }, {
            new: true,
        })
            .lean();
        return ResponseHandler_1.default.success(enquiry, 'readBy updated successfully.');
    }
    async getChatGroupDetail(params) {
        const { chatId, user, employerAdminId } = params;
        const find = employerAdminId
            ? { _id: mongoose.Types.ObjectId(chatId), employerAdmin: mongoose.Types.ObjectId(employerAdminId) }
            : user.role !== 'superadmin' && user.role !== 'admin'
                ? { _id: mongoose.Types.ObjectId(chatId), users: mongoose.Types.ObjectId(user._id) }
                : { _id: mongoose.Types.ObjectId(chatId) };
        const chatGroup = await this.employerEnquiryModel
            .findOne(find)
            .populate('users', 'fullname profilePhoto profilePhotoThumbnail role')
            .populate('employerAdmin', 'fullname profilePhoto profilePhotoThumbnail')
            .lean()
            .exec();
        if (!chatGroup) {
            return ResponseHandler_1.default.fail('You are not part of this chat.');
        }
        return ResponseHandler_1.default.success(chatGroup);
    }
};
EmployerEnquiriesService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('employer-enquiries')),
    __param(1, mongoose_1.InjectModel('employer-enquiry-messages')),
    __param(2, mongoose_1.InjectModel('employer-admins')),
    __param(3, mongoose_1.InjectModel('colleges')),
    __param(4, mongoose_1.InjectModel('users')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, notifications_service_1.NotificationsService,
        mailer_1.MailerService,
        email_logs_service_1.EmailLogsService])
], EmployerEnquiriesService);
exports.EmployerEnquiriesService = EmployerEnquiriesService;
//# sourceMappingURL=employer-enquiries.service.js.map