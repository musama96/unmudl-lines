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
const mongoose = require("mongoose");
const activityText_1 = require("./activityText");
const activity_model_1 = require("./activity.model");
let ActivitiesService = class ActivitiesService {
    constructor(activityModel, userActivityModel, transactionActivityModel, userModel, courseModel) {
        this.activityModel = activityModel;
        this.userActivityModel = userActivityModel;
        this.transactionActivityModel = transactionActivityModel;
        this.userModel = userModel;
        this.courseModel = courseModel;
    }
    async getActivities(params) {
        const { type, start, end, userId, courseId, learnerId, page, perPage, collegeId } = params;
        const match = {};
        if (type) {
            match.type = type;
        }
        const startDate = start ? new Date(start) : new Date(new Date().setFullYear(0));
        const endDate = end ? new Date(end) : new Date();
        if (userId) {
            match.user = mongoose.Types.ObjectId(userId);
        }
        if (courseId) {
            match.course = mongoose.Types.ObjectId(courseId);
        }
        if (learnerId) {
            match.learner = mongoose.Types.ObjectId(learnerId);
        }
        if (collegeId && type === activity_model_1.ActivityTypes.User) {
            const userList = await this.userModel
                .find({ collegeId }, '_id')
                .lean()
                .exec();
            if (userList.length > 0) {
                const users = userList.map(user => user._id);
                match.user = { $in: users };
            }
            else {
                match.user = { $in: [] };
            }
        }
        if (collegeId && type === activity_model_1.ActivityTypes.Transaction) {
            const courseList = await this.courseModel
                .find({
                collegeId,
                createdAt: { $gte: new Date(startDate) },
                enrollmentDeadline: { $lte: new Date(endDate) },
            }, '_id')
                .lean()
                .exec();
            if (courseList.length > 0) {
                const courses = courseList.map(course => course._id);
                match.course = { $in: courses };
            }
            else {
                match.course = { $in: [] };
            }
        }
        if (collegeId && type !== activity_model_1.ActivityTypes.Transaction && type !== activity_model_1.ActivityTypes.User) {
            const [userList, courseList] = await Promise.all([
                this.userModel.find({ collegeId, role: { $ne: 'system' } }, '_id').lean().exec(),
                this.courseModel.find({ collegeId, createdAt: { $gte: new Date(startDate) }, enrollmentDeadline: { $lte: new Date(endDate) } }, '_id')
                    .lean().exec(),
            ]);
            const courses = courseList.length > 0 ? courseList.map(course => course._id) : [];
            const users = userList.length > 0 ? userList.map(user => user._id) : [];
            match.$or = [{ course: { $in: courses } }, { user: { $in: users } }];
        }
        const pipeline = [];
        pipeline.push({
            $match: match,
        });
        pipeline.push(...[
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
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
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'learners',
                    localField: 'learner',
                    foreignField: '_id',
                    as: 'learner',
                },
            },
            { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'enrollments',
                    localField: 'enrollment',
                    foreignField: '_id',
                    as: 'enrollment',
                },
            },
            { $unwind: { path: '$enrollment', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'promos',
                    localField: 'promo',
                    foreignField: '_id',
                    as: 'promo',
                },
            },
            { $unwind: { path: '$promo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'otherUser',
                    foreignField: '_id',
                    as: 'otherUser',
                },
            },
            { $unwind: { path: '$otherUser', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'useractivitycategories',
                    localField: 'userActivity',
                    foreignField: '_id',
                    as: 'userActivity',
                },
            },
            { $unwind: { path: '$userActivity', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'transactionactivitycategories',
                    localField: 'transactionActivity',
                    foreignField: '_id',
                    as: 'transactionActivity',
                },
            },
            { $unwind: { path: '$transactionActivity', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    type: 1,
                    userRole: 1,
                    'user.fullname': 1,
                    'course.title': 1,
                    'learner.fullname': 1,
                    'promo.title': 1,
                    'enrollment.totalPaid': 1,
                    'enrollment.transactionId': 1,
                    'otherUser.fullname': 1,
                    'userActivity.name': 1,
                    'transactionActivity.name': 1,
                    'userActivity.color': 1,
                    'transactionActivity.color': 1,
                    createdAt: 1,
                },
            },
        ]);
        let activities = await this.activityModel
            .aggregate(pipeline)
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        activities = activities.filter(activity => activity.userActivity ? activity.userActivity.name : activity.transactionActivity ? activity.transactionActivity.name : '');
        activities.forEach(activity => {
            activity.text = activityText_1.generateActivityText(activity);
        });
        return ResponseHandler_1.default.success(activities);
    }
    async getTransactionActivitiesCsv(params) {
        const { start, end, collegeId } = params;
        const match = {
            type: 'transaction',
        };
        const startDate = start ? new Date(start) : new Date(new Date().setFullYear(0));
        const endDate = end ? new Date(end) : new Date();
        const courseList = await this.courseModel
            .find({
            collegeId,
            createdAt: { $gte: new Date(startDate) },
            enrollmentDeadline: { $lte: new Date(endDate) },
        }, '_id')
            .lean()
            .exec();
        if (courseList.length > 0) {
            const courses = courseList.map(course => course._id);
            match.course = { $in: courses };
        }
        else {
            match.course = { $in: [] };
        }
        const pipeline = [];
        pipeline.push({
            $match: match,
        });
        pipeline.push(...[
            {
                $match: {
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
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
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'learners',
                    localField: 'learner',
                    foreignField: '_id',
                    as: 'learner',
                },
            },
            { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'course',
                },
            },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'enrollments',
                    localField: 'enrollment',
                    foreignField: '_id',
                    as: 'enrollment',
                },
            },
            { $unwind: { path: '$enrollment', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'promos',
                    localField: 'promo',
                    foreignField: '_id',
                    as: 'promo',
                },
            },
            { $unwind: { path: '$promo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'otherUser',
                    foreignField: '_id',
                    as: 'otherUser',
                },
            },
            { $unwind: { path: '$otherUser', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'useractivitycategories',
                    localField: 'userActivity',
                    foreignField: '_id',
                    as: 'userActivity',
                },
            },
            { $unwind: { path: '$userActivity', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'transactionactivitycategories',
                    localField: 'transactionActivity',
                    foreignField: '_id',
                    as: 'transactionActivity',
                },
            },
            { $unwind: { path: '$transactionActivity', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    type: 1,
                    userRole: 1,
                    'user.fullname': 1,
                    'course.title': 1,
                    'learner.fullname': 1,
                    'promo.title': 1,
                    enrollment: 1,
                    'otherUser.fullname': 1,
                    'userActivity.name': 1,
                    'transactionActivity.name': 1,
                    createdAt: 1,
                },
            },
        ]);
        let activities = await this.activityModel.aggregate(pipeline).exec();
        activities = activities.filter(activity => (activity.transactionActivity ? activity.transactionActivity.name : ''));
        return ResponseHandler_1.default.success(activities);
    }
    async createActivities(activities) {
        return await this.activityModel.insertMany(activities);
    }
    async getUserActivityId(name) {
        const res = await this.userActivityModel.findOne({ name }).lean();
        return res._id;
    }
    async getTransactionActivityId(name) {
        const res = await this.transactionActivityModel.findOne({ name }).lean();
        return res._id;
    }
};
ActivitiesService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('activities')),
    __param(1, mongoose_1.InjectModel('useractivitycategories')),
    __param(2, mongoose_1.InjectModel('transactionactivitycategories')),
    __param(3, mongoose_1.InjectModel('users')),
    __param(4, mongoose_1.InjectModel('courses')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ActivitiesService);
exports.ActivitiesService = ActivitiesService;
//# sourceMappingURL=activities.service.js.map