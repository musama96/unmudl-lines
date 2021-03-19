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
const notifications_service_1 = require("../notifications/notifications.service");
const resolveReportedActivity_dto_1 = require("./dto/resolveReportedActivity.dto");
const mongoose = require("mongoose");
let ReportedActivitiesService = class ReportedActivitiesService {
    constructor(reportedActivityModel, notificationsService) {
        this.reportedActivityModel = reportedActivityModel;
        this.notificationsService = notificationsService;
    }
    async addReport(report) {
        let newReport = await this.reportedActivityModel(report);
        newReport = await newReport.save();
        return ResponseHandler_1.default.success(newReport);
    }
    async getReportedActivities(params) {
        const { page, perPage, sortOrder, sortBy } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const [activities, rows] = await Promise.all([
            this.reportedActivityModel
                .aggregate([
                {
                    $sort: {
                        createdAt: 1,
                    },
                },
                {
                    $lookup: {
                        from: 'learners',
                        localField: 'reportedLearnerId',
                        foreignField: '_id',
                        as: 'reportedLearner',
                    },
                },
                {
                    $lookup: {
                        from: 'learners',
                        localField: 'reportingLearnerId',
                        foreignField: '_id',
                        as: 'reportingLearner',
                    },
                },
                {
                    $lookup: {
                        from: 'colleges',
                        localField: 'reportingCollegeId',
                        foreignField: '_id',
                        as: 'reportingCollege',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'reportingUserId',
                        foreignField: '_id',
                        as: 'reportingUser',
                    },
                },
                {
                    $project: {
                        'reportedLearner.fullname': { $arrayElemAt: ['$reportedLearner.fullname', 0] },
                        'reportedLearner.profilePhoto': { $arrayElemAt: ['$reportedLearner.profilePhoto', 0] },
                        'reportedLearner.profilePhotoThumbnail': { $arrayElemAt: ['$reportedLearner.profilePhotoThumbnail', 0] },
                        'reportingLearner.fullname': { $arrayElemAt: ['$reportingLearner.fullname', 0] },
                        'reportingLearner.profilePhoto': { $arrayElemAt: ['$reportingLearner.profilePhoto', 0] },
                        'reportingLearner.profilePhotoThumbnail': { $arrayElemAt: ['$reportingLearner.profilePhotoThumbnail', 0] },
                        reportingCollege: { $arrayElemAt: ['$reportingCollege.title', 0] },
                        'reportingUser.fullname': { $arrayElemAt: ['$reportingUser.fullname', 0] },
                        'reportingUser.profilePhoto': { $arrayElemAt: ['$reportingUser.profilePhoto', 0] },
                        'reportingUser.profilePhotoThumbnail': { $arrayElemAt: ['$reportingUser.profilePhotoThumbnail', 0] },
                        reviewDate: 1,
                        reviewId: 1,
                        resolutionDate: 1,
                        status: 1,
                    },
                },
                {
                    $group: {
                        _id: '$reviewId',
                        reportedLearner: { $first: '$reportedLearner' },
                        reportingLearner: { $first: '$reportingLearner' },
                        reportingCollege: { $first: '$reportingCollege' },
                        reportingUser: { $first: '$reportingUser' },
                        reviewDate: { $first: '$reviewDate' },
                        resolutionDate: { $first: '$resolutionDate' },
                        status: { $first: '$status' },
                        noOfReports: { $sum: 1 },
                        reportId: { $first: '$_id' },
                    },
                },
                { $unset: '_id' },
                { $addFields: { _id: '$reportId' } },
                { $unset: 'reportId' },
                { $unwind: { path: '$reportedLearner', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$reportingLearner', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$reportingUser', preserveNullAndEmptyArrays: true } },
                {
                    $sort: sort,
                },
            ])
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec(),
            this.reportedActivityModel.distinct('reviewId'),
        ]);
        return ResponseHandler_1.default.success({ activities, rows: rows.length });
    }
    async getReportedActivityDetails(id) {
        const activity = await this.reportedActivityModel
            .aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(id),
                },
            },
            {
                $lookup: {
                    from: 'learners',
                    localField: 'reportedLearnerId',
                    foreignField: '_id',
                    as: 'reportedLearner',
                },
            },
            {
                $lookup: {
                    from: 'learners',
                    localField: 'reportingLearnerId',
                    foreignField: '_id',
                    as: 'reportingLearner',
                },
            },
            {
                $lookup: {
                    from: 'colleges',
                    localField: 'reportingCollegeId',
                    foreignField: '_id',
                    as: 'reportingCollege',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'reportingUserId',
                    foreignField: '_id',
                    as: 'reportingUser',
                },
            },
            {
                $lookup: {
                    from: 'reported-activities',
                    localField: 'reviewId',
                    foreignField: 'reviewId',
                    as: 'reports',
                },
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'reviewId',
                    foreignField: 'reviews._id',
                    as: 'course',
                },
            },
            {
                $project: {
                    'reportedLearner.fullname': { $arrayElemAt: ['$reportedLearner.fullname', 0] },
                    'reportedLearner.profilePhoto': { $arrayElemAt: ['$reportedLearner.profilePhoto', 0] },
                    'reportedLearner.profilePhotoThumbnail': { $arrayElemAt: ['$reportedLearner.profilePhotoThumbnail', 0] },
                    'reportingLearner.fullname': { $arrayElemAt: ['$reportingLearner.fullname', 0] },
                    'reportingLearner.profilePhoto': { $arrayElemAt: ['$reportingLearner.profilePhoto', 0] },
                    'reportingLearner.profilePhotoThumbnail': { $arrayElemAt: ['$reportingLearner.profilePhotoThumbnail', 0] },
                    reportingCollege: { $arrayElemAt: ['$reportingCollege.title', 0] },
                    'reportingUser.fullname': { $arrayElemAt: ['$reportingUser.fullname', 0] },
                    'reportingUser.profilePhoto': { $arrayElemAt: ['$reportingUser.profilePhoto', 0] },
                    'reportingUser.profilePhotoThumbnail': { $arrayElemAt: ['$reportingUser.profilePhotoThumbnail', 0] },
                    reports: { $size: '$reports' },
                    reviewDate: 1,
                    status: 1,
                    comment: 1,
                },
            },
            { $unwind: { path: '$reportedLearner', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$reportingLearner', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$reportingUser', preserveNullAndEmptyArrays: true } },
        ])
            .exec();
        return ResponseHandler_1.default.success(activity.length > 0 ? activity[0] : null);
    }
    async updateReportStatus({ reportedActivityId, status }) {
        const report = await this.reportedActivityModel
            .findByIdAndUpdate(reportedActivityId, {
            $set: { status },
        }, { new: true })
            .exec();
        if (status === resolveReportedActivity_dto_1.ResolveReportedActivityStatusEnum.WARNED) {
            this.notificationsService.reviewReported(report);
        }
        return report;
    }
};
ReportedActivitiesService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('reported-activities')),
    __metadata("design:paramtypes", [Object, notifications_service_1.NotificationsService])
], ReportedActivitiesService);
exports.ReportedActivitiesService = ReportedActivitiesService;
//# sourceMappingURL=reported-activities.service.js.map