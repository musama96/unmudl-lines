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
const mailer_1 = require("@nest-modules/mailer");
const notifications_service_1 = require("../notifications/notifications.service");
const bcrypt = require("bcryptjs");
const ResponseHandler_1 = require("../common/ResponseHandler");
const mongoose = require("mongoose");
const responseMessages_1 = require("../config/responseMessages");
const moment = require("moment");
const json2csv = require("json2csv");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const email_logs_service_1 = require("../email-logs/email-logs.service");
const employerAdminsNotification_model_1 = require("../notifications/employerAdminsNotification.model");
const s3_1 = require("../s3upload/s3");
const chat_service_1 = require("../chat/chat.service");
let EmployerAdminsService = class EmployerAdminsService {
    constructor(mailerService, notificationsService, employerAdminModel, employerAdminInvitationModel, employerAdminNotificationModel, trashedEmployerAdminModel, counterModel, employerAdminTokenModel, emailLogsService, chatService) {
        this.mailerService = mailerService;
        this.notificationsService = notificationsService;
        this.employerAdminModel = employerAdminModel;
        this.employerAdminInvitationModel = employerAdminInvitationModel;
        this.employerAdminNotificationModel = employerAdminNotificationModel;
        this.trashedEmployerAdminModel = trashedEmployerAdminModel;
        this.counterModel = counterModel;
        this.employerAdminTokenModel = employerAdminTokenModel;
        this.emailLogsService = emailLogsService;
        this.chatService = chatService;
        this.saltRounds = 10;
    }
    async getAdminsList(params) {
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
        return ResponseHandler_1.default.success({ admins, rows });
    }
    async getAdminNamesList({ keyword, employerId }) {
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
        return ResponseHandler_1.default.success(admins);
    }
    async getAdminsListCsv(params) {
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
    async validateEmployerAdminForLogin(authCredentialsDto) {
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
            .findOneAndUpdate({
            _id: userId,
        }, {
            $set: {
                lastLoggedIn: Date.now(),
            },
        })
            .exec();
    }
    async changePassword(params, adminId) {
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
            return ResponseHandler_1.default.success(null, responseMessages_1.default.success.updatePassword);
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.updateUser.invalidOldPassword);
        }
    }
    async updatePassword(password, adminId) {
        try {
            const passwordHash = await this.getHash(password);
            const updatedUser = await this.employerAdminModel.findOneAndUpdate({ _id: adminId }, { password: passwordHash });
            return !!updatedUser;
        }
        catch (_a) {
            return false;
        }
    }
    async updateDetails(details, adminId) {
        const response = await this.employerAdminModel.findByIdAndUpdate(adminId, {
            $set: details,
        }, { new: true });
        return ResponseHandler_1.default.success(response, responseMessages_1.default.success.updateUser);
    }
    async updateRole(updateRole, admin) {
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
            mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.EMPLOYER) : null;
            return ResponseHandler_1.default.success(updatedAdmin);
        }
        else {
            return ResponseHandler_1.default.fail('Employer admin not found.');
        }
    }
    async createEmployerAdminToken(adminId) {
        const token = await this.getHash(adminId);
        const newEmployerAdminToken = new this.employerAdminTokenModel({
            adminId,
            token: encodeURIComponent(token),
        });
        const result = await newEmployerAdminToken.save();
        return result.token;
    }
    async insertInvitedAdmin(admin) {
        const newAdmin = new this.employerAdminModel(admin);
        newAdmin.invitation = 'pending';
        const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { employerAdmin: 1 } }, {
            new: true,
            upsert: true,
        }).lean();
        newAdmin.numId = counter.user;
        const result = await newAdmin.save();
        return ResponseHandler_1.default.success(result, 'Employer admin created successfully.');
    }
    async updateStripeCustomerId(userId, stripeCustomerId) {
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
    async verifyToken(employerAdminToken, remove = false) {
        const token = await this.employerAdminTokenModel
            .findOne({ token: employerAdminToken.token })
            .lean()
            .exec();
        if (remove) {
            await this.employerAdminTokenModel.deleteOne({ token: employerAdminToken.token }).exec();
        }
        return token;
    }
    async getUserByEmail(emailAddress, lean = false) {
        const exists = this.employerAdminModel.findOne({ emailAddress });
        if (lean) {
            return ResponseHandler_1.default.success(await exists.lean());
        }
        else {
            return ResponseHandler_1.default.success(await exists.exec());
        }
    }
    async sendResetPasswordLink(admin) {
        try {
            const token = await this.createEmployerAdminToken(admin._id.toString());
            const url = config_1.EMPLOYER_FORGOT_PASSWORD_URL;
            const text = 'Click the link to reset your password ' + url + token;
            const mailData = {
                to: admin.emailAddress,
                from: process.env.PARTNER_NOREPLY_FROM,
                subject: 'Password reset link',
                template: 'employerPasswordReset',
                context: {
                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                    siteName: process.env.SITE_NAME,
                    url,
                    token,
                },
            };
            const mail = await this.mailerService.sendMail(mailData);
            mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.EMPLOYER) : null;
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async getAdminByEmail(emailAddress, lean = true) {
        const admin = this.employerAdminModel.findOne({ emailAddress });
        if (lean) {
            return await admin.lean();
        }
        else {
            return await admin.exec();
        }
    }
    async getAdminById(id, lean = true) {
        const admin = this.employerAdminModel.findById(id);
        if (lean) {
            return await admin.lean();
        }
        else {
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
        return ResponseHandler_1.default.success(null, 'Admins suspended successfully.');
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
        return ResponseHandler_1.default.success(null, 'Admins un-suspended successfully.');
    }
    async initializeContactUnmudlChatsForAllEmployerAdmins() {
        let admins = await this.employerAdminModel.find().lean();
        admins = await Promise.all(admins.map(async (admin) => {
            const { data: chats } = await this.chatService.initializeContactUnmudlChats(admin);
            admin.chats = chats;
            return admin;
        }));
        return ResponseHandler_1.default.success(admins);
    }
    async getAdminData(id) {
        const admin = await this.employerAdminModel
            .findById(id)
            .populate('employerId')
            .lean()
            .exec();
        return ResponseHandler_1.default.success({
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
                .find({ $or: [{ receiver: user._id }, { identifier: employerAdminsNotification_model_1.EmployerAdminNotificationsIdentifiers.FORUM_POST }] })
                .sort({ updatedAt: -1 })
                .paginate(page, perPage)
                .populate('chat')
                .populate('chatMessage')
                .lean(),
            this.employerAdminNotificationModel.countDocuments({ receiver: user._id, isSeen: false }),
        ]);
        const notificationIds = notifications.map(notification => mongoose.Types.ObjectId(notification._id));
        await this.employerAdminNotificationModel.updateMany({ _id: { $in: notificationIds } }, { $set: { isSeen: true } }, { multi: true, upsert: false, timestamps: false });
        return ResponseHandler_1.default.success({ notifications, unreadNotificationsCount });
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
            files.length > 0 ? await s3_1.removeFilesFromS3(files) : null;
        }
        const newUser = await this.employerAdminModel.findByIdAndUpdate(id, user, { new: true }).lean();
        return ResponseHandler_1.default.success(newUser, 'Profile details updated successfully.');
    }
    async updatePreferences(details, employerAdminId) {
        const notifications = {
            email: details.email,
            proposal: details.proposal,
            chat: details.chat,
            newNotification: details.newNotification,
        };
        const response = await this.employerAdminModel.findByIdAndUpdate(employerAdminId, {
            $set: {
                notifications,
            },
        }, { new: true });
        return ResponseHandler_1.default.success(response, responseMessages_1.default.success.updatePreferences);
    }
    async compareHash(password, hash) {
        return bcrypt.compare(password, hash);
    }
    async getHash(password) {
        return bcrypt.hash(password, this.saltRounds);
    }
};
EmployerAdminsService = __decorate([
    common_1.Injectable(),
    __param(2, mongoose_1.InjectModel('employer-admins')),
    __param(3, mongoose_1.InjectModel('employer-admin-invitations')),
    __param(4, mongoose_1.InjectModel('employer-admin-notifications')),
    __param(5, mongoose_1.InjectModel('trashed-employer-admins')),
    __param(6, mongoose_1.InjectModel('id-counters')),
    __param(7, mongoose_1.InjectModel('employer-admin-tokens')),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        notifications_service_1.NotificationsService, Object, Object, Object, Object, Object, Object, email_logs_service_1.EmailLogsService,
        chat_service_1.ChatService])
], EmployerAdminsService);
exports.EmployerAdminsService = EmployerAdminsService;
//# sourceMappingURL=employer-admins.service.js.map