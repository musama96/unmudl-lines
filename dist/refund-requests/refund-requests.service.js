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
const ResponseHandler_1 = require("../common/ResponseHandler");
const createRefund_enum_1 = require("../common/enums/createRefund.enum");
const responseMessages_1 = require("../config/responseMessages");
const notifications_service_1 = require("../notifications/notifications.service");
const mongoose = require("mongoose");
const mailer_1 = require("@nest-modules/mailer");
const moment = require("moment");
const email_logs_service_1 = require("../email-logs/email-logs.service");
const email_logs_model_1 = require("../email-logs/email-logs.model");
let RefundRequestsService = class RefundRequestsService {
    constructor(refundRequestModel, userModel, learnerModel, courseModel, notificationsService, mailerService, emailLogsService) {
        this.refundRequestModel = refundRequestModel;
        this.userModel = userModel;
        this.learnerModel = learnerModel;
        this.courseModel = courseModel;
        this.notificationsService = notificationsService;
        this.mailerService = mailerService;
        this.emailLogsService = emailLogsService;
    }
    async getRefundRequestDetails(requestId) {
        const details = await this.refundRequestModel
            .aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(requestId),
                },
            },
            {
                $lookup: {
                    from: 'learners',
                    localField: 'requestedBy',
                    foreignField: '_id',
                    as: 'learner',
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    let: { courseId: '$courseId' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$_id', '$$courseId'] }] } } },
                        {
                            $lookup: {
                                from: 'colleges',
                                localField: 'collegeId',
                                foreignField: '_id',
                                as: 'college',
                            },
                        },
                        { $unwind: '$college' },
                    ],
                    as: 'course',
                },
            },
            {
                $lookup: {
                    from: 'enrollments',
                    localField: 'requestedBy',
                    foreignField: 'learnerId',
                    as: 'enrollments',
                },
            },
            {
                $project: {
                    learnerName: { $arrayElemAt: ['$learner.fullname', 0] },
                    dateJoined: { $arrayElemAt: ['$learner.createdAt', 0] },
                    courseName: { $arrayElemAt: ['$course.title', 0] },
                    collegeName: { $arrayElemAt: ['$course.college.title', 0] },
                    price: { $arrayElemAt: ['$course.price', 0] },
                    validEnrollments: {
                        $filter: {
                            input: '$enrollments',
                            as: 'enrollment',
                            cond: {
                                $or: [
                                    { $eq: ['$$enrollment.status', 'pending'] },
                                    { $eq: ['$$enrollment.status', 'approved'] },
                                    { $eq: ['$$enrollment.status', 'processed'] },
                                    { $eq: ['$$enrollment.status', 'transferred'] },
                                ],
                            },
                        },
                    },
                    enrollmentDeadline: { $arrayElemAt: ['$course.enrollmentDeadline', 0] },
                    dateOfRequest: '$createdAt',
                    reason: 1,
                    otherInfo: 1,
                    status: 1,
                },
            },
            {
                $addFields: {
                    totalAmountSpent: {
                        $sum: '$validEnrollments.totalPaid',
                    },
                    totalCoursesBought: {
                        $size: '$validEnrollments',
                    },
                },
            },
        ])
            .exec();
        return ResponseHandler_1.default.success(details.length > 0 ? details[0] : null);
    }
    async getRefundRequestByEnrollment(enrollmentId) {
        const request = await this.refundRequestModel.findOne({ enrollmentId }).lean();
        return ResponseHandler_1.default.success(request);
    }
    async getRefundRequests(params) {
        const { page, perPage, sortBy, sortOrder, collegeId } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const pipeline = [];
        pipeline.push(...[
            {
                $lookup: {
                    from: 'learners',
                    localField: 'requestedBy',
                    foreignField: '_id',
                    as: 'learner',
                },
            },
            { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        ]);
        if (collegeId) {
            pipeline.push({
                $match: {
                    'course.collegeId': mongoose.Types.ObjectId(collegeId),
                },
            });
        }
        pipeline.push(...[
            {
                $lookup: {
                    from: 'colleges',
                    localField: 'course.collegeId',
                    foreignField: '_id',
                    as: 'college',
                },
            },
            { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    learnerName: '$learner.fullname',
                    learnerProfilePhoto: '$learner.profilePhoto',
                    learnerProfilePhotoThumbnail: '$learner.profilePhotoThumbnail',
                    courseName: '$course.title',
                    collegeName: '$college.title',
                    price: { $add: ['$course.price', { $multiply: ['$course.price', { $divide: ['$college.unmudlShare', 100] }] }] },
                    priceWithTax: { $add: ['$price', { $multiply: ['$price', { $divide: ['$college.salesTax', 100] }] }] },
                    enrollmentDeadline: '$course.enrollmentDeadline',
                    requestDate: '$createdAt',
                    dateResolved: 1,
                    status: 1,
                },
            },
            {
                $sort: sort,
            },
        ]);
        const [requests, { data: rows }] = await Promise.all([
            this.refundRequestModel
                .aggregate(pipeline)
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec(),
            this.getRefundRequestsRows(params),
        ]);
        return ResponseHandler_1.default.success({
            requests,
            rows,
        });
    }
    async getRefundRequestsRows(params) {
        const { collegeId } = params;
        const pipeline = [];
        pipeline.push(...[
            {
                $lookup: {
                    from: 'learners',
                    localField: 'requestedBy',
                    foreignField: '_id',
                    as: 'learner',
                },
            },
            { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
        ]);
        if (collegeId) {
            pipeline.push({
                $match: {
                    'course.collegeId': mongoose.Types.ObjectId(collegeId),
                },
            });
        }
        pipeline.push(...[
            {
                $group: {
                    _id: null,
                    rows: { $sum: 1 },
                },
            },
        ]);
        const rows = await this.refundRequestModel.aggregate(pipeline).exec();
        return ResponseHandler_1.default.success(rows.length > 0 ? rows[0].rows : 0);
    }
    async createRefundRequest(request) {
        let newRequest = new this.refundRequestModel(request);
        newRequest = await newRequest.save();
        this.notificationsService.refundRequest(newRequest);
        await this.sendCollegeMail(request);
        return ResponseHandler_1.default.success(newRequest, responseMessages_1.default.success.createRefundRequest);
    }
    async sendCollegeMail(request) {
        const [learner, course] = await Promise.all([
            this.learnerModel
                .findById(request.requestedBy, 'fullname')
                .lean()
                .exec(),
            this.courseModel.findById(request.courseId, 'collegeId title').populate('collegeId', 'title'),
        ]);
        const collegeAdmin = await this.userModel
            .find({
            collegeId: mongoose.Types.ObjectId(course.collegeId._id),
            role: { $in: ['superadmin', 'admin'] },
            'notifications.email': { $ne: false },
        }, 'fullname emailAddress')
            .lean()
            .exec();
        if (collegeAdmin && collegeAdmin.length > 0) {
            for (let i = 0; i < collegeAdmin.length; i++) {
                setTimeout(async () => {
                    const mailData = {
                        to: collegeAdmin[i].emailAddress,
                        from: process.env.PARTNER_NOTIFICATION_FROM,
                        subject: 'Unmudl learner is requesting refund',
                        template: 'collegeMailOnRefundRequest',
                        context: {
                            unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                            date: moment(new Date()).format('LL'),
                            learner,
                            course,
                            college: course.collegeId,
                            collegeLoginLink: process.env.COLLEGE_LOGIN_LINK,
                            refundMail: process.env.REFUND_MAIL,
                        },
                    };
                    const mail = await this.mailerService.sendMail(mailData);
                    mail ? this.emailLogsService.createEmailLog(mailData, email_logs_model_1.Portal.ADMIN) : null;
                }, 1000);
            }
        }
    }
    async rejectRefundRequest(requestId) {
        const request = await this.refundRequestModel
            .findByIdAndUpdate(requestId, {
            $set: {
                status: createRefund_enum_1.RefundStatus.REJECTED,
            },
        }, { new: true })
            .lean();
        this.notificationsService.refundRequest(request);
        return ResponseHandler_1.default.success(request, responseMessages_1.default.success.rejectRefundRequest);
    }
    async getRequestDetails(requestId) {
        const request = await this.refundRequestModel
            .findById(requestId)
            .populate('enrollmentId', '+payableToUnmudl')
            .populate('requestedBy')
            .populate({
            path: 'courseId',
            populate: {
                path: 'collegeId',
            },
        })
            .lean();
        return ResponseHandler_1.default.success(request);
    }
    async setRefundRequestStatus(requestId, status) {
        const request = await this.refundRequestModel
            .findByIdAndUpdate(requestId, {
            $set: {
                status,
            },
        }, { new: true })
            .lean();
        return ResponseHandler_1.default.success(request);
    }
    async approveRefundRequest(requestId, stripeData) {
        const request = await this.refundRequestModel
            .findByIdAndUpdate(requestId, {
            $set: {
                status: 'refunded',
                refundId: stripeData.id,
                refundAmount: stripeData ? stripeData.amount / 100 : 0,
                dateResolved: new Date(),
            },
        }, { new: true })
            .populate('enrollmentId')
            .lean();
        this.notificationsService.refundRequest(request);
        return ResponseHandler_1.default.success(request);
    }
};
RefundRequestsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('refund-requests')),
    __param(1, mongoose_1.InjectModel('users')),
    __param(2, mongoose_1.InjectModel('learners')),
    __param(3, mongoose_1.InjectModel('courses')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notifications_service_1.NotificationsService,
        mailer_1.MailerService,
        email_logs_service_1.EmailLogsService])
], RefundRequestsService);
exports.RefundRequestsService = RefundRequestsService;
//# sourceMappingURL=refund-requests.service.js.map