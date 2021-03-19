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
const user_model_1 = require("./user.model");
const userTokens_service_1 = require("./userTokens.service");
const ResponseHandler_1 = require("../common/ResponseHandler");
const mailer_1 = require("@nest-modules/mailer");
const config_1 = require("../config/config");
const mongoose = require("mongoose");
const responseMessages_1 = require("../config/responseMessages");
const json2csv = require("json2csv");
const sort_enum_1 = require("../common/enums/sort.enum");
const enrollmentStatus_enum_1 = require("../common/enums/enrollmentStatus.enum");
const bcrypt = require("bcryptjs");
const notifications_service_1 = require("../notifications/notifications.service");
const moment = require("moment");
const email_logs_model_1 = require("../email-logs/email-logs.model");
const email_logs_service_1 = require("../email-logs/email-logs.service");
const s3_1 = require("../s3upload/s3");
let UsersService = class UsersService {
    constructor(userModel, trashedUserModel, courseModel, invitationModel, counterModel, notificationsModel, activitiesModel, mailerService, notificationsService, emailLogsService, userTokensService) {
        this.userModel = userModel;
        this.trashedUserModel = trashedUserModel;
        this.courseModel = courseModel;
        this.invitationModel = invitationModel;
        this.counterModel = counterModel;
        this.notificationsModel = notificationsModel;
        this.activitiesModel = activitiesModel;
        this.mailerService = mailerService;
        this.notificationsService = notificationsService;
        this.emailLogsService = emailLogsService;
        this.userTokensService = userTokensService;
        this.saltRounds = 10;
    }
    async insertInvitedUser(user) {
        const newUser = new this.userModel(user);
        newUser.invitation = 'pending';
        const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { user: 1 } }, { new: true, upsert: true }).lean();
        newUser.numId = counter.user;
        const result = await newUser.save();
        return ResponseHandler_1.default.success(result, 'User created successfully.');
    }
    async insertUser(user) {
        const newUser = new this.userModel(user);
        newUser.password = await this.getHash(user.password);
        const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { user: 1 } }, { new: true, upsert: true }).lean();
        newUser.numId = counter.user;
        const result = await newUser.save();
        result.password = '';
        return ResponseHandler_1.default.success(result, 'User created successfully.');
    }
    async insertAdmin(user) {
        user = this.pick(user, 'fullname', 'emailAddress', 'password', 'role', 'collegeId', 'designation');
        const newUser = new this.userModel(user);
        newUser.password = await this.getHash(user.password);
        const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { user: 1 } }, { new: true, upsert: true }).lean();
        newUser.numId = counter.user;
        const result = await newUser.save();
        result.password = '';
        return ResponseHandler_1.default.success(result, 'User created successfully.');
    }
    async updateCollegeAdmin(user) {
        user.password = await this.getHash(user.password);
        const updatedUser = await this.userModel.findOneAndUpdate({ emailAddress: user.emailAddress }, user, { new: true }).lean();
        return updatedUser;
    }
    async updateInvitedUser(user) {
        const { password, profilePhoto, profilePhotoThumbnail, designation, emailAddress } = user;
        const passwordHash = await this.getHash(password);
        const updatedUser = await this.userModel.findOneAndUpdate({
            emailAddress,
        }, {
            $set: {
                password: passwordHash,
                profilePhoto,
                profilePhotoThumbnail,
                designation,
                invitation: 'accepted',
            },
        }, { new: true });
        return ResponseHandler_1.default.success(updatedUser);
    }
    async updateUserRole(role, userId) {
        const newUser = await this.userModel
            .findByIdAndUpdate(userId, {
            $set: { role },
        }, {
            new: true,
        })
            .lean();
        return ResponseHandler_1.default.success(newUser, 'User data updated successfully.');
    }
    async updateBasicDetails(details, userId) {
        let existingUser;
        if (details.profilePhoto) {
            existingUser = await this.userModel
                .findById(userId, 'profilePhoto profilePhotoThumbnail')
                .lean()
                .exec();
            const files = [];
            existingUser.profilePhoto !== details.profilePhoto ? files.push(existingUser.profilePhoto) : null;
            existingUser.profilePhotoThumbnail !== details.profilePhotoThumbnail ? files.push(existingUser.profilePhotoThumbnail) : null;
            files.length > 0 ? await s3_1.removeFilesFromS3(files) : null;
        }
        const response = await this.userModel.findByIdAndUpdate(userId, {
            $set: details,
        }, { new: true });
        return ResponseHandler_1.default.success(response, responseMessages_1.default.success.updateUser);
    }
    async updatePreferences(details, userId) {
        const notifications = {
            email: details.email,
            enrollment: details.enrollment,
            refund: details.refund,
            newNotification: details.newNotification,
            buyCourse: details.buyCourse,
        };
        const response = await this.userModel.findByIdAndUpdate(userId, {
            $set: {
                notifications,
            },
        }, { new: true });
        return ResponseHandler_1.default.success(response, responseMessages_1.default.success.updatePreferences);
    }
    async updateDetails(details, userId) {
        let existingUser;
        if (details.profilePhoto) {
            existingUser = await this.userModel
                .findById(userId, 'profilePhoto profilePhotoThumbnail')
                .lean()
                .exec();
            const files = [];
            existingUser.profilePhoto && existingUser.profilePhoto !== details.profilePhoto ? files.push(existingUser.profilePhoto) : null;
            existingUser.profilePhotoThumbnail && existingUser.profilePhotoThumbnail !== details.profilePhotoThumbnail
                ? files.push(existingUser.profilePhotoThumbnail)
                : null;
            files.length > 0 ? await s3_1.removeFilesFromS3(files) : null;
        }
        const response = await this.userModel.findByIdAndUpdate(userId, {
            $set: details,
        }, { new: true });
        return ResponseHandler_1.default.success(response, responseMessages_1.default.success.updateUser);
    }
    async checkExistingUser(emailAddress, userId) {
        return await this.userModel.findOne({ emailAddress, _id: { $ne: mongoose.Types.ObjectId(userId) } }).lean();
    }
    async sendResetPasswordLink(user) {
        try {
            const token = await this.userTokensService.createUserToken(user._id.toString());
            const url = user.collegeId ? config_1.COLLEGE_FORGOT_PASSWORD_URL : config_1.ADMIN_FORGOT_PASSWORD_URL;
            const mailData = {
                to: user.emailAddress,
                from: user.collegeId ? process.env.PARTNER_NOREPLY_FROM : process.env.ADMIN_NOREPLY_FROM,
                subject: 'Password reset link',
                template: 'userPasswordReset',
                context: {
                    unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                    siteName: process.env.SITE_NAME,
                    url,
                    token,
                },
            };
            const mail = await this.mailerService.sendMail(mailData);
            mail ? this.emailLogsService.createEmailLog(mailData, user.collegeId ? email_logs_model_1.Portal.COLLEGE : email_logs_model_1.Portal.ADMIN) : null;
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    async getUsers(params) {
        const keyword = params.keyword;
        const page = Number(params.page);
        const collegeId = params.collegeId;
        const perPage = Number(params.perPage);
        let users = this.userModel.find({ role: { $ne: 'system' } }).byName(keyword);
        let rows = this.userModel.countDocuments({ role: { $ne: 'system' } }).byName(keyword);
        if (collegeId) {
            users = users.byCollege(collegeId);
            rows = rows.byCollege(collegeId);
        }
        users = await users.paginate(page, perPage).exec();
        rows = await rows.exec();
        return ResponseHandler_1.default.success({
            users,
            rows,
        });
    }
    async getInstructors(params) {
        const { keyword, collegeId, page, perPage, sortOrder, sortBy } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const pipeline = [];
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: 'instructor',
            invitation: 'accepted',
        };
        if (collegeId) {
            match.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        pipeline.push(...[
            {
                $match: match,
            },
            {
                $lookup: {
                    from: 'courses',
                    let: { userId: '$_id' },
                    pipeline: [
                        { $unwind: '$instructorIds' },
                        {
                            $match: { $expr: { $and: [{ $eq: ['$instructorIds', '$$userId'] }] } },
                        },
                        { $sort: { 'date.end': -1 } },
                    ],
                    as: 'course',
                },
            },
            {
                $project: {
                    _id: 1,
                    fullname: 1,
                    emailAddress: 1,
                    profilePhoto: 1,
                    profilePhotoThumbnail: 1,
                    designation: 1,
                    lastLoggedIn: 1,
                    lastCourseTaught: { $arrayElemAt: ['$course.title', 0] },
                    topCourseCollegeRevenue: { $max: '$course.collegeRevenue' },
                    topCourseTotalRevenue: { $max: '$course.totalRevenue' },
                    topCourseSharedRevenue: { $max: '$course.unmudlRevenue' },
                    coursesTaught: { $size: '$course' },
                    averageRating: { $avg: '$course.rating' },
                    isSuspended: 1,
                    createdAt: 1,
                },
            },
            {
                $sort: sort,
            },
        ]);
        const instructors = await this.userModel
            .aggregate(pipeline)
            .collation({ locale: 'en', strength: 2 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        const rows = await this.getInstructorsCount(params);
        return ResponseHandler_1.default.success({
            instructors,
            rows: rows.data,
        });
    }
    async getInstructorNames(params) {
        const { keyword, collegeId } = params;
        const instructors = await this.userModel
            .find({
            fullname: { $regex: keyword, $options: 'i' },
            role: user_model_1.UserRoles.INSTRUCTOR,
            collegeId: mongoose.Types.ObjectId(collegeId),
            isSuspended: false,
        }, 'fullname profilePhoto profilePhotoThumbnail invitation')
            .lean();
        return ResponseHandler_1.default.success(instructors);
    }
    async getUsersNames(params) {
        const { keyword, collegeId } = params;
        const users = await this.userModel
            .find({
            fullname: { $regex: keyword, $options: 'i' },
            collegeId: mongoose.Types.ObjectId(collegeId),
            isSuspended: false,
            role: { $ne: 'system' },
        }, 'fullname profilePhoto profilePhotoThumbnail type')
            .lean();
        return ResponseHandler_1.default.success(users);
    }
    async getInvitedInstructors(params) {
        const { keyword, collegeId, page, perPage, sortOrder, sortBy, status } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: 'instructor',
        };
        if (collegeId) {
            match.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        if (status) {
            match.status = { $in: status };
        }
        const instructors = await this.invitationModel
            .aggregate([
            {
                $match: match,
            },
            {
                $sort: sort,
            },
        ])
            .collation({ locale: 'en', strength: 2 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        const rows = await this.getInvitedInstructorsCount(params);
        return ResponseHandler_1.default.success({
            instructors,
            rows: rows.data,
        });
    }
    async getInstructorsCount(params) {
        const { keyword, collegeId } = params;
        const pipeline = [];
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: 'instructor',
            invitation: 'accepted',
        };
        if (collegeId) {
            match.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        pipeline.push(...[
            {
                $match: match,
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: 'instructorIds',
                    as: 'course',
                },
            },
            {
                $unwind: {
                    path: '$course',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    'course.createdAt': -1,
                },
            },
            {
                $group: {
                    _id: '$_id',
                },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                },
            },
        ]);
        const count = await this.userModel.aggregate(pipeline).exec();
        return ResponseHandler_1.default.success(count.length > 0 ? count[0].count : 0);
    }
    async getInvitedInstructorsCount(params) {
        const { keyword, collegeId, status } = params;
        const pipeline = [];
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: 'instructor',
        };
        if (collegeId) {
            match.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        if (status) {
            match.status = { $in: status };
        }
        pipeline.push(...[
            {
                $match: match,
            },
            {
                $group: {
                    _id: null,
                    rows: { $sum: 1 },
                },
            },
        ]);
        const count = await this.invitationModel.aggregate(pipeline).exec();
        return ResponseHandler_1.default.success(count.length > 0 ? count[0].rows : 0);
    }
    async getInstructorsCsv(params) {
        const { keyword, collegeId, sortOrder, sortBy } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const pipeline = [];
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: 'instructor',
            invitation: 'accepted',
        };
        if (collegeId) {
            match.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        pipeline.push(...[
            {
                $match: match,
            },
            {
                $lookup: {
                    from: 'courses',
                    let: { userId: '$_id' },
                    pipeline: [
                        { $unwind: '$instructorIds' },
                        {
                            $match: { $expr: { $and: [{ $eq: ['$instructorIds', '$$userId'] }] } },
                        },
                        { $sort: { 'date.end': -1 } },
                    ],
                    as: 'course',
                },
            },
            {
                $project: {
                    Name: '$fullname',
                    emailAddress: '$emailAddress',
                    designation: '$designation',
                    'Last Logged In': { $dateToString: { date: '$lastLoggedIn', format: '%Y-%m-%d' } },
                    'Last Course Taught': { $arrayElemAt: ['$course.title', 0] },
                    'Top Course Revenue': { $max: '$course.collegeRevenue' },
                    'Total Courses Taught': { $size: '$course' },
                    'Average Rating': { $avg: '$course.rating' },
                    createdAt: 1,
                },
            },
            {
                $sort: sort,
            },
        ]);
        const instructors = await this.userModel.aggregate(pipeline).exec();
        const fields = ['Name', 'Last Logged In', 'Last Course Taught', 'Top Course Revenue', 'Total Courses Taught', 'Average Rating'];
        return json2csv.parse(instructors, { fields });
    }
    async getInvitedInstructorsCsv(params) {
        const { keyword, collegeId, sortOrder, sortBy, status } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: 'instructor',
        };
        if (collegeId) {
            match.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        if (status) {
            match.status = { $in: status };
        }
        const instructors = await this.invitationModel
            .aggregate([
            {
                $match: match,
            },
            {
                $sort: sort,
            },
            {
                $project: {
                    'Full Name': '$fullname',
                    Email: '$emailAddress',
                    'Invitation Date': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
                    Status: '$status',
                },
            },
        ])
            .collation({ locale: 'en', strength: 2 })
            .exec();
        const fields = ['Full Name', 'Email', 'Invitation Date', 'Status'];
        return json2csv.parse(instructors, { fields });
    }
    async getAdmins(params) {
        const { keyword, collegeId, page, perPage, sortBy, sortOrder } = params;
        const sort = [[sortBy, Number(sortOrder)]];
        const find = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: {
                $nin: ['instructor', 'system'],
            },
            invitation: 'accepted',
        };
        if (collegeId) {
            find.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        else {
            find.collegeId = null;
        }
        const admins = await this.userModel
            .find(find)
            .sort(sort)
            .collation({ locale: 'en', strength: 2 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        const rows = await this.getAdminsCount(params);
        return ResponseHandler_1.default.success({
            admins,
            rows: rows.data,
        });
    }
    async getInvitedAdmins(params) {
        const { keyword, collegeId, page, perPage, sortBy, sortOrder, status } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: {
                $nin: ['instructor', 'system'],
            },
        };
        match.collegeId = collegeId ? mongoose.Types.ObjectId(collegeId) : null;
        if (status) {
            match.status = { $in: status };
        }
        const admins = await this.invitationModel
            .aggregate([
            {
                $match: match,
            },
            {
                $sort: sort,
            },
        ])
            .collation({ locale: 'en', strength: 2 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        const rows = await this.getInvitedAdminsCount(params);
        return ResponseHandler_1.default.success({
            admins,
            rows: rows.data,
        });
    }
    async getAdminsCount(params) {
        const { keyword, collegeId } = params;
        const find = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: {
                $nin: ['instructor', 'system'],
            },
            invitation: 'accepted',
        };
        if (collegeId) {
            find.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        else {
            find.collegeId = null;
        }
        const count = await this.userModel.countDocuments(find).exec();
        return ResponseHandler_1.default.success(count);
    }
    async getAdminsCsv(params) {
        const { keyword, collegeId, sortBy, sortOrder } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const find = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: {
                $nin: ['instructor', 'system'],
            },
            invitation: 'accepted',
        };
        if (collegeId) {
            find.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        else {
            find.collegeId = null;
        }
        const admins = await this.userModel
            .aggregate([
            {
                $match: find,
            },
            {
                $project: {
                    Name: '$fullname',
                    'Email Address': '$emailAddress',
                    Designation: '$designation',
                    'Last Logged In': { $dateToString: { date: '$lastLoggedIn', format: '%Y-%m-%d' } },
                    'Joining Date': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
                    'Permission Level': {
                        $concat: [
                            { $toUpper: { $substrCP: ['$role', 0, 1] } },
                            {
                                $substrCP: ['$role', 1, { $subtract: [{ $strLenCP: '$role' }, 1] }],
                            },
                        ],
                    },
                    createdAt: 1,
                },
            },
            {
                $sort: sort,
            },
        ])
            .collation({ locale: 'en', strength: 2 })
            .exec();
        const fields = ['Name', 'Email Address', 'Designation', 'Last Logged In', 'Joining Date', 'Permission Level'];
        return json2csv.parse(admins, { fields });
    }
    async getInvitedAdminsCsv(params) {
        const { keyword, collegeId, sortOrder, sortBy, status } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: {
                $nin: ['instructor', 'system'],
            },
        };
        if (collegeId) {
            match.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        else {
            match.collegeId = null;
        }
        if (status) {
            match.status = { $in: status };
        }
        const admins = await this.invitationModel
            .aggregate([
            {
                $match: match,
            },
            {
                $sort: sort,
            },
            {
                $project: {
                    'Full Name': '$fullname',
                    Email: '$emailAddress',
                    'Invitation Date': { $dateToString: { date: '$createdAt', format: '%Y-%m-%d' } },
                    Status: '$status',
                    'Permission Level': '$role',
                },
            },
        ])
            .collation({ locale: 'en', strength: 2 })
            .exec();
        const fields = ['Full Name', 'Email', 'Invitation Date', 'Status', 'Permission Level'];
        return json2csv.parse(admins, { fields });
    }
    async getInvitedAdminsCount(params) {
        const { keyword, collegeId, status } = params;
        const pipeline = [];
        const match = {
            fullname: {
                $regex: keyword,
                $options: 'i',
            },
            role: {
                $ne: 'instructor',
            },
        };
        if (collegeId) {
            match.collegeId = mongoose.Types.ObjectId(collegeId);
        }
        else {
            match.collegeId = null;
        }
        if (status) {
            match.status = { $in: status };
        }
        pipeline.push(...[
            {
                $match: match,
            },
            {
                $group: {
                    _id: null,
                    rows: { $sum: 1 },
                },
            },
        ]);
        const count = await this.invitationModel.aggregate(pipeline).exec();
        return ResponseHandler_1.default.success(count.length > 0 ? count[0].rows : 0);
    }
    async updateRole(updateRole, user) {
        const userId = mongoose.Types.ObjectId(updateRole.userId);
        const existingUser = await this.userModel
            .findById(userId, 'role')
            .lean()
            .exec();
        let filter = {};
        if (user.collegeId) {
            filter = { _id: userId, collegeId: user.collegeId };
        }
        else {
            filter = { _id: userId };
        }
        const update = existingUser && existingUser.role === user_model_1.UserRoles.INSTRUCTOR && updateRole.role !== user_model_1.UserRoles.INSTRUCTOR
            ? { role: updateRole.role, isPromoted: true }
            : { role: updateRole.role };
        const updatedUser = await this.userModel.findOneAndUpdate(filter, update, { new: true }).exec();
        if (updatedUser) {
            await this.invitationModel.findOneAndUpdate({ emailAddress: updatedUser.emailAddress }, update, { new: true }).exec();
        }
        this.notificationsService.permissionLevelUpdated(updatedUser, user);
        const mailData = {
            to: updatedUser.emailAddress,
            from: updatedUser.collegeId ? process.env.PARTNER_NOREPLY_FROM : process.env.ADMIN_NOREPLY_FROM,
            subject: 'UNMUDL Notification',
            template: 'updateRole',
            context: {
                unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                date: moment(new Date()).format('LL'),
                user: updatedUser,
            },
        };
        const mail = await this.mailerService.sendMail(mailData);
        mail ? this.emailLogsService.createEmailLog(mailData, user.collegeId ? email_logs_model_1.Portal.COLLEGE : email_logs_model_1.Portal.ADMIN) : null;
        return ResponseHandler_1.default.success(updatedUser);
    }
    async getUserByEmail(emailAddress) {
        return await this.userModel.findOne({ emailAddress }).lean();
    }
    async getUserByEmailMongoObj(emailAddress) {
        return await this.userModel.findOne({ emailAddress }).exec();
    }
    async getUsersList(params, emailAddress) {
        const { keyword, collegeId } = params;
        const find = { invitation: 'accepted', emailAddress: { $ne: emailAddress }, role: { $ne: 'system' } };
        if (collegeId) {
            find.collegeId = { $in: [mongoose.Types.ObjectId(collegeId), null] };
        }
        const users = await this.userModel
            .find(find, 'fullname profilePhoto profilePhotoThumbnail role collegeId')
            .byName(keyword ? keyword : '')
            .limit(10)
            .lean()
            .exec();
        return ResponseHandler_1.default.success(users);
    }
    async getUserById(userId) {
        return await this.userModel
            .findById(userId)
            .lean()
            .exec();
    }
    async getUserByIdMongoObj(userId) {
        return await this.userModel.findById(userId).exec();
    }
    async getCollegeAccountCounts(params = null) {
        const find = {};
        const { start, end, collegeId } = params;
        if (start || end) {
            find.createdAt = {};
            if (start) {
                find.createdAt.$gte = new Date(start);
            }
            if (end) {
                find.createdAt.$lte = new Date(end);
            }
        }
        find.collegeId = collegeId ? collegeId : { $ne: null };
        const count = await this.userModel.countDocuments(find).exec();
        return ResponseHandler_1.default.success(count);
    }
    async checkIfEmailExists(emailAddress) {
        const exists = await this.userModel.findOne({ emailAddress }).exec();
        return ResponseHandler_1.default.success(exists, exists ? '' : 'User not found.');
    }
    async validateUserForLogin(authCredentialsDto) {
        const { emailAddress, password } = authCredentialsDto;
        const user = await this.userModel
            .findOne({ emailAddress })
            .populate('collegeId')
            .select('+password')
            .lean()
            .exec();
        if (user && user.password && (await this.compareHash(password.toString(), user.password))) {
            return user;
        }
        if (user && (user.isSuspended || (user.invitation && user.invitation !== 'accepted'))) {
            return user;
        }
        return null;
    }
    async updatePassword(password, userId) {
        try {
            const passwordHash = await this.getHash(password);
            const updatedUser = await this.userModel.findOneAndUpdate({ _id: userId }, { password: passwordHash });
            return !!updatedUser;
        }
        catch (_a) {
            return false;
        }
    }
    async updateStripeCustomerId(userId, stripeCustomerId) {
        await this.userModel.findOneAndUpdate({ _id: userId }, { $set: { stripeCustomerId } });
    }
    async getUnmudlAdminsForEmail() {
        const admins = await this.userModel
            .find({
            collegeId: null,
            role: { $in: ['superadmin', 'admin'] },
            'notifications.email': { $ne: false },
        }, 'fullname emailAddress')
            .lean()
            .exec();
        return ResponseHandler_1.default.success(admins);
    }
    async getCollegeSuperAdmin(collegeId) {
        const admin = await this.userModel.findOne({ collegeId: collegeId ? collegeId : { $ne: null }, role: 'superadmin' }).lean();
        return ResponseHandler_1.default.success(admin);
    }
    async getCollegeSuperAdmins(collegeId) {
        const admin = await this.userModel.find({ collegeId, role: 'superadmin' }).lean();
        return ResponseHandler_1.default.success(admin);
    }
    async changePassword(params, userId) {
        let { newPassword } = params;
        const { oldPassword } = params;
        newPassword = await this.getHash(newPassword);
        const user = await this.userModel
            .findById(userId)
            .select('+password')
            .exec();
        if (user && (await this.compareHash(oldPassword, user.password))) {
            await this.userModel.findByIdAndUpdate(user, {
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
    async updateLastLoggedIn(userId) {
        await this.userModel
            .findOneAndUpdate({
            _id: userId,
        }, {
            $set: {
                lastLoggedIn: Date.now(),
            },
        })
            .exec();
    }
    async getAdminData(id) {
        const admin = await this.userModel
            .findById(id)
            .populate('collegeId')
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
                employerId: admin.collegeId ? admin.collegeId._id : null,
                employer: admin.collegeId ? admin.collegeId.title : null,
                employerDomain: admin.collegeId ? admin.collegeId.domain : null,
                employerLogo: admin.collegeId ? admin.collegeId.collegeLogo : null,
                employerLogoThumbnail: admin.collegeId ? admin.collegeId.employerLogoThumbnail : null,
                role: admin.role,
            },
        });
    }
    async getInstructorDetails(instructor) {
        const instructorId = mongoose.Types.ObjectId(instructor.userId);
        const [instructorDetails, latestCourse] = await Promise.all([
            this.userModel.aggregate([
                { $match: { _id: instructorId } },
                {
                    $lookup: {
                        from: 'courses',
                        localField: '_id',
                        foreignField: 'instructorIds',
                        as: 'courses',
                    },
                },
                {
                    $addFields: {
                        rating: { $avg: '$courses.instructorRating' },
                        collegeRevenue: { $sum: '$courses.collegeRevenue' },
                        totalRevenue: { $sum: '$courses.totalRevenue' },
                        unmudlRevenue: { $sum: '$courses.unmudlRevenue' },
                        totalCourses: { $size: '$courses' },
                    },
                },
                {
                    $project: {
                        rating: 1,
                        role: 1,
                        totalRevenue: 1,
                        unmudlRevenue: 1,
                        collegeRevenue: 1,
                        totalCourses: 1,
                        fullname: 1,
                        emailAddress: 1,
                        profilePhoto: 1,
                        profilePhotoThumbnail: 1,
                        lastLoggedIn: 1,
                        joinDate: '$createdAt',
                        bio: 1,
                    },
                },
            ]),
            this.courseModel
                .find({ instructorIds: instructorId, 'date.end': { $lte: new Date() } }, 'title')
                .sort({ 'date.end': -1 })
                .limit(1)
                .lean(),
        ]);
        instructorDetails[0].lastCourseTaught = latestCourse.length > 0 ? latestCourse[0].title : null;
        return ResponseHandler_1.default.success({
            instructorDetails: instructorDetails[0],
        });
    }
    async getTopInstructors(params) {
        const { page, perPage, start, end } = params;
        const pipeline = [];
        const match = {
            role: 'instructor',
        };
        if (start || end) {
            match.createdAt = {};
            if (start) {
                match.createdAt.$gte = new Date(start);
            }
            if (end) {
                match.createdAt.$lte = new Date(end);
            }
        }
        pipeline.push({
            $match: match,
        });
        const rowsPipeline = pipeline;
        pipeline.push(...[
            {
                $lookup: {
                    from: 'colleges',
                    localField: 'collegeId',
                    foreignField: '_id',
                    as: 'college',
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: 'instructorIds',
                    as: 'course',
                },
            },
            {
                $addFields: {
                    coursesTaught: {
                        $size: '$course',
                    },
                },
            },
            {
                $unwind: {
                    path: '$course',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    totalRevenue: -1,
                },
            },
            {
                $group: {
                    _id: '$_id',
                    fullname: { $first: '$fullname' },
                    profilePhoto: { $first: '$profilePhoto' },
                    profilePhotoThumbnail: { $first: '$profilePhotoThumbnail' },
                    title: { $first: { $arrayElemAt: ['$college.title', 0] } },
                    topCourseRevenue: { $first: '$course.totalRevenue' },
                    topCourseRatings: { $push: '$course.reviews.ratings.rating' },
                    coursesTaught: { $first: '$coursesTaught' },
                },
            },
            {
                $unwind: {
                    path: '$topCourseRatings',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$topCourseRatings',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$topCourseRatings',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: '$_id',
                    fullname: { $first: '$fullname' },
                    profilePhoto: { $first: '$profilePhoto' },
                    profilePhotoThumbnail: { $first: '$profilePhotoThumbnail' },
                    college: { $first: '$title' },
                    topCourseRevenue: { $first: '$topCourseRevenue' },
                    averageRatings: { $avg: '$topCourseRatings' },
                    coursesTaught: { $first: '$coursesTaught' },
                },
            },
            {
                $sort: {
                    topCourseRevenue: -1,
                },
            },
        ]);
        const instructors = await this.userModel
            .aggregate(pipeline)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        rowsPipeline.push({
            $group: {
                _id: null,
                rows: { $sum: 1 },
            },
        });
        const rows = await this.userModel.aggregate(rowsPipeline).exec();
        return ResponseHandler_1.default.success({
            instructors,
            rows: rows.length > 0 ? rows[0].rows : 0,
        });
    }
    async getTopInstructorsCsv(params) {
        const { page, perPage, start, end } = params;
        const pipeline = [];
        const match = {
            role: 'instructor',
        };
        if (start || end) {
            match.createdAt = {};
            if (start) {
                match.createdAt.$gte = new Date(start);
            }
            if (end) {
                match.createdAt.$lte = new Date(end);
            }
        }
        pipeline.push({
            $match: match,
        });
        const rowsPipeline = pipeline;
        pipeline.push(...[
            {
                $lookup: {
                    from: 'colleges',
                    localField: 'collegeId',
                    foreignField: '_id',
                    as: 'college',
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: 'instructorIds',
                    as: 'course',
                },
            },
            {
                $addFields: {
                    coursesTaught: {
                        $size: '$course',
                    },
                },
            },
            {
                $unwind: {
                    path: '$course',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    totalRevenue: -1,
                },
            },
            {
                $group: {
                    _id: '$_id',
                    fullname: { $first: '$fullname' },
                    title: { $first: { $arrayElemAt: ['$college.title', 0] } },
                    topCourseRevenue: { $first: '$course.totalRevenue' },
                    topCourseRatings: { $push: '$course.reviews.ratings.rating' },
                    coursesTaught: { $first: '$coursesTaught' },
                },
            },
            {
                $unwind: {
                    path: '$topCourseRatings',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$topCourseRatings',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: '$topCourseRatings',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: '$_id',
                    'Instructor Name': { $first: '$fullname' },
                    'College Name': { $first: '$title' },
                    'Top Course Revenue': { $first: '$topCourseRevenue' },
                    'Average Ratings': { $avg: '$topCourseRatings' },
                    'Total Courses Taught': { $first: '$coursesTaught' },
                },
            },
            {
                $sort: {
                    'Top Course Revenue': -1,
                },
            },
        ]);
        const instructors = await this.userModel
            .aggregate(pipeline)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        const fields = ['Instructor Name', 'College Name', 'Top Course Revenue', 'Total Courses Taught', 'Average Ratings'];
        return json2csv.parse(instructors, { fields });
    }
    async getInstructorCourses(coursesList) {
        let sortObj = {};
        switch (coursesList.column) {
            case sort_enum_1.InstructorCoursesColumns.courseName:
                sortObj = { title: Number(coursesList.order) };
                break;
            case sort_enum_1.InstructorCoursesColumns.price:
                sortObj = { price: Number(coursesList.order) };
                break;
            case sort_enum_1.InstructorCoursesColumns.totalEnrollments:
                sortObj = { totalEnrollments: Number(coursesList.order) };
                break;
            case sort_enum_1.InstructorCoursesColumns.enrollmentsAllowed:
                sortObj = { enrollmentsAllowed: Number(coursesList.order) };
                break;
            case sort_enum_1.InstructorCoursesColumns.totalEarnings:
                sortObj = { totalRevenue: Number(coursesList.order) };
                break;
            case sort_enum_1.InstructorCoursesColumns.enrollmentDeadline:
                sortObj = { enrollmentDeadline: Number(coursesList.order) };
                break;
        }
        const instructorId = mongoose.Types.ObjectId(coursesList.userId);
        const [List, count] = await Promise.all([
            this.courseModel
                .aggregate([
                {
                    $match: { instructorIds: instructorId },
                },
                {
                    $lookup: {
                        from: 'enrollments',
                        localField: '_id',
                        foreignField: 'courseId',
                        as: 'enrollments',
                    },
                },
                {
                    $project: {
                        enrollments: {
                            $filter: {
                                input: '$enrollments',
                                as: 'enroll',
                                cond: {
                                    $and: [
                                        { $ne: ['$$enroll.status', enrollmentStatus_enum_1.EnrollmentStatus.CANCELED] },
                                        { $ne: ['$$enroll.status', enrollmentStatus_enum_1.EnrollmentStatus.REFUNDED] },
                                        { $ne: ['$$enroll.status', enrollmentStatus_enum_1.EnrollmentStatus.DECLINED] },
                                    ],
                                },
                            },
                        },
                        title: '$title',
                        rating: '$rating',
                        totalRevenue: '$collegeRevenue',
                        unmudlRevenue: '$unmudlRevenue',
                        enrollmentsCanceled: '$enrollmentsCanceled',
                        enrollmentDeadline: '$enrollmentDeadline',
                        enrollmentsAllowed: '$enrollmentsAllowed',
                        coverPhoto: '$coverPhoto',
                        coverPhotoThumbnail: '$coverPhotoThumbnail',
                        price: '$price',
                    },
                },
                {
                    $addFields: {
                        enrolled: { $size: '$enrollments' },
                    },
                },
                { $sort: sortObj },
                { $skip: (coursesList.page - 1) * coursesList.perPage },
                { $limit: coursesList.perPage },
                { $unset: 'enrollments' },
            ])
                .collation({ locale: 'en', strength: 2 })
                .exec(),
            this.courseModel.countDocuments({ instructorIds: instructorId }),
        ]);
        return ResponseHandler_1.default.success({
            List,
            count,
        });
    }
    async hasCourses(instructorId) {
        return await this.courseModel
            .findOne({ instructorIds: instructorId })
            .select({ title: 1 })
            .lean();
    }
    async removeUser(userIdDto) {
        const user = await this.userModel.findById(userIdDto.userId).lean();
        const trashedUser = user;
        trashedUser.userId = user._id;
        delete trashedUser._id;
        await Promise.all([
            this.trashedUserModel.create(trashedUser),
            this.courseModel.updateMany({ instructorIds: userIdDto.userId }, { $pull: { instructorIds: userIdDto.userId } }, { multi: true }),
            this.invitationModel.deleteOne({ emailAddress: user.emailAddress }),
            this.activitiesModel.deleteMany({ user: user._id }),
            this.activitiesModel.deleteMany({ otherUser: user._id }),
        ]);
        return await this.userModel.deleteOne({ _id: mongoose.Types.ObjectId(userIdDto.userId) });
    }
    async removeInstructorFromCourses(instructor) {
        return await this.courseModel.update({ instructorIds: instructor.userId }, { $pull: { instructorIds: instructor.userId } }, { multi: true });
    }
    async getUserNotifications(params, user) {
        const { page, perPage } = params;
        const [notifications, unreadNotificationsCount] = await Promise.all([
            this.notificationsModel
                .find({
                $or: [{ receiver: user._id }, { channel: user.collegeId ? 'notification-cadmins' : 'notification-uadmins' }],
            })
                .sort({ updatedAt: -1 })
                .paginate(page, perPage)
                .populate('chat', 'module moduleDocumentId')
                .lean(),
            this.notificationsModel.countDocuments({
                $or: [{ receiver: user._id }, { channel: user.collegeId ? 'notification-cadmins' : 'notification-uadmins' }],
                isSeen: false,
            }),
        ]);
        const notificationIds = notifications.map(notification => mongoose.Types.ObjectId(notification._id));
        await this.notificationsModel.updateMany({ _id: { $in: notificationIds } }, { $set: { isSeen: true } }, { multi: true, upsert: false, timestamps: false });
        return ResponseHandler_1.default.success({ notifications, unreadNotificationsCount });
    }
    async getHash(password) {
        return bcrypt.hash(password, this.saltRounds);
    }
    async compareHash(password, hash) {
        return bcrypt.compare(password, hash);
    }
    pick(obj, ...keys) {
        const copy = {};
        keys.forEach(key => (copy[key] = obj[key]));
        return copy;
    }
};
UsersService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('users')),
    __param(1, mongoose_1.InjectModel('trashedUsers')),
    __param(2, mongoose_1.InjectModel('courses')),
    __param(3, mongoose_1.InjectModel('invitations')),
    __param(4, mongoose_1.InjectModel('id-counters')),
    __param(5, mongoose_1.InjectModel('user-notifications')),
    __param(6, mongoose_1.InjectModel('activities')),
    __param(10, common_1.Inject(common_1.forwardRef(() => userTokens_service_1.UserTokensService))),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, mailer_1.MailerService,
        notifications_service_1.NotificationsService,
        email_logs_service_1.EmailLogsService,
        userTokens_service_1.UserTokensService])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map