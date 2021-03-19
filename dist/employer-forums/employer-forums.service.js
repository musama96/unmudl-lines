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
const responseMessages_1 = require("../config/responseMessages");
const moment = require("moment");
const notifications_service_1 = require("../notifications/notifications.service");
let EmployerPostsService = class EmployerPostsService {
    constructor(employerPostModel, employerCommentModel, employerReplyModel, employerPostTagModel, postReportModel, counterModel, notificationsService) {
        this.employerPostModel = employerPostModel;
        this.employerCommentModel = employerCommentModel;
        this.employerReplyModel = employerReplyModel;
        this.employerPostTagModel = employerPostTagModel;
        this.postReportModel = postReportModel;
        this.counterModel = counterModel;
        this.notificationsService = notificationsService;
    }
    async getTotalPostsAndReplies({ start, end }) {
        start = start ? start : moment().subtract(30, 'day');
        end = end ? end : moment().add(1, 'day');
        const [totalDiscussions, totalReplies] = await Promise.all([
            this.employerPostModel.countDocuments({ createdAt: { $lte: end, $gte: start } }),
            this.employerCommentModel.countDocuments({ createdAt: { $lte: end, $gte: start } }),
        ]);
        return { totalDiscussions, totalReplies };
    }
    async createPost(postDto) {
        const post = await this.employerPostModel.create(postDto);
        this.notificationsService.newEmployerForumPost(post);
        return ResponseHandler_1.default.success(post);
    }
    async editPost(postDto, user) {
        const postId = mongoose.Types.ObjectId(postDto.postId);
        const filter = { _id: postId };
        if (user.type !== 'employer') {
            filter.user = mongoose.Types.ObjectId(user._id);
        }
        else {
            filter.employerAdmin = mongoose.Types.ObjectId(user._id);
        }
        const post = await this.employerPostModel.findOneAndUpdate(filter, postDto, { new: true });
        if (post) {
            return ResponseHandler_1.default.success(post);
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.post.wrongAuthor);
        }
    }
    async getPosts(params) {
        const { keyword, page, perPage, popular, myTopics, user } = params;
        const sortObj = popular ? { totalComments: -1, createdAt: -1 } : { createdAt: -1 };
        const filter = myTopics ? (user.type !== 'employer' ? { user: user._id } : { employerAdmin: user._id }) : {};
        const [postList, totalPosts] = await Promise.all([
            this.employerPostModel
                .find(filter)
                .byTopic(keyword)
                .sort(sortObj)
                .paginate(page, perPage)
                .populate('tags')
                .populate({
                path: 'user',
                select: 'fullname profilePhoto profilePhotoThumbnail designation collegeId role',
                populate: { path: 'collegeId', select: 'title' },
            })
                .populate({
                path: 'employerAdmin',
                select: 'fullname profilePhoto profilePhotoThumbnail designation employerId',
                populate: { path: 'employerId', select: 'title' },
            })
                .lean()
                .exec(),
            this.employerPostModel.countDocuments(filter).byTopic(keyword),
        ]);
        return { postList, totalPosts };
    }
    async getPostById(postId) {
        return await this.employerPostModel
            .findById(postId)
            .populate('author', 'fullname profilePhoto profilePhotoThumbnail')
            .populate('tags')
            .lean();
    }
    async getPost(postId) {
        return await this.employerPostModel
            .findById(postId)
            .populate({
            path: 'user',
            select: 'fullname profilePhoto profilePhotoThumbnail designation collegeId role',
            populate: { path: 'collegeId', select: 'title' },
        })
            .populate({
            path: 'employerAdmin',
            select: 'fullname profilePhoto profilePhotoThumbnail designation employerId',
            populate: { path: 'employerId', select: 'title' },
        })
            .populate('tags')
            .lean();
    }
    async getForumTopics(employerId) {
        const topics = await this.employerPostModel
            .aggregate([
            {
                $lookup: {
                    from: 'employer-admins',
                    localField: 'employerAdmin',
                    foreignField: '_id',
                    as: 'employerAdmin',
                },
            },
            {
                $unwind: '$employerAdmin',
            },
            {
                $match: {
                    'employerAdmin.employerId': mongoose.Types.ObjectId(employerId),
                },
            },
            {
                $group: {
                    _id: null,
                    topics: { $sum: 1 },
                },
            },
        ])
            .exec();
        return ResponseHandler_1.default.success(topics.length > 0 ? topics[0].topics : 0);
    }
    async addComment(commentDto) {
        let comment = new this.employerCommentModel(commentDto);
        comment = await comment.save();
        await this.employerPostModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(commentDto.employerPost) }, { $inc: { totalComments: 1 } });
        await comment
            .populate('employerPost', 'topic totalComments user employerAdmin')
            .populate({
            path: 'user',
            select: 'fullname profilePhoto profilePhotoThumbnail designation collegeId role',
            populate: { path: 'collegeId', select: 'title' },
        })
            .populate({
            path: 'employerAdmin',
            select: 'fullname profilePhoto profilePhotoThumbnail designation employerId',
            populate: { path: 'employerId', select: 'title' },
        })
            .execPopulate();
        this.notificationsService.newEmployerForumComment(comment);
        return ResponseHandler_1.default.success(comment);
    }
    async addReply(replyDto) {
        let reply = new this.employerReplyModel(replyDto);
        reply = await reply.save();
        await reply
            .populate({
            path: 'user',
            select: 'fullname profilePhoto profilePhotoThumbnail designation collegeId role',
            populate: { path: 'collegeId', select: 'title' },
        })
            .populate({
            path: 'employerAdmin',
            select: 'fullname profilePhoto profilePhotoThumbnail designation employerId',
            populate: { path: 'employerId', select: 'title' },
        })
            .execPopulate();
        await this.employerCommentModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(replyDto.employerComment) }, { $inc: { totalReplies: 1 } });
        this.notificationsService.newEmployerForumReply(reply);
        return ResponseHandler_1.default.success(reply);
    }
    async editComment(commentDto) {
        const commentId = mongoose.Types.ObjectId(commentDto.commentId);
        const filter = { _id: commentId };
        if (commentDto.user) {
            filter.user = mongoose.Types.ObjectId(commentDto.user);
        }
        else {
            filter.employerAdmin = mongoose.Types.ObjectId(commentDto.employerAdmin);
        }
        const reply = await this.employerCommentModel.findOneAndUpdate(filter, commentDto, { new: true });
        if (reply) {
            return ResponseHandler_1.default.success(reply);
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.post.editReply);
        }
    }
    async editReply(replyDto) {
        const replyId = mongoose.Types.ObjectId(replyDto.replyId);
        const filter = { _id: replyId };
        if (replyDto.user) {
            filter.user = mongoose.Types.ObjectId(replyDto.user);
        }
        else {
            filter.employerAdmin = mongoose.Types.ObjectId(replyDto.employerAdmin);
        }
        const reply = await this.employerReplyModel.findOneAndUpdate(filter, replyDto, { new: true });
        if (reply) {
            return ResponseHandler_1.default.success(reply);
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.post.editReply);
        }
    }
    async getComments(params) {
        const { page, perPage, postId } = params;
        const [commentsList, totalComments] = await Promise.all([
            this.employerCommentModel.aggregate([
                { $match: { employerPost: mongoose.Types.ObjectId(postId) } },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * perPage },
                { $limit: perPage },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: '$user' },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ['$_id', '$$userId'] }] } } },
                            {
                                $project: {
                                    fullname: 1,
                                    profilePhoto: 1,
                                    profilePhotoThumbnail: 1,
                                    designation: 1,
                                    collegeId: 1,
                                    role: 1,
                                },
                            },
                            {
                                $lookup: {
                                    from: 'colleges',
                                    let: { collegeId: '$collegeId' },
                                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$collegeId'] }] } } }, { $project: { title: 1 } }],
                                    as: 'collegeId',
                                },
                            },
                            { $unwind: { path: '$collegeId', preserveNullAndEmptyArrays: true } },
                        ],
                        as: 'user',
                    },
                },
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'employer-admins',
                        let: { employerAdminId: '$employerAdmin' },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ['$_id', '$$employerAdminId'] }] } } },
                            {
                                $project: {
                                    fullname: 1,
                                    profilePhoto: 1,
                                    profilePhotoThumbnail: 1,
                                    designation: 1,
                                    employerId: 1,
                                    role: 1,
                                },
                            },
                            {
                                $lookup: {
                                    from: 'employer-companies',
                                    let: { employerId: '$employerId' },
                                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$employerId'] }] } } }, { $project: { title: 1 } }],
                                    as: 'employerId',
                                },
                            },
                            { $unwind: { path: '$employerId', preserveNullAndEmptyArrays: true } },
                        ],
                        as: 'employerAdmin',
                    },
                },
                { $unwind: { path: '$employerAdmin', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'employer-replies',
                        let: { employerCommentId: '$_id' },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ['$employerComment', '$$employerCommentId'] }] } } },
                            {
                                $lookup: {
                                    from: 'users',
                                    let: { userId: '$user' },
                                    pipeline: [
                                        { $match: { $expr: { $and: [{ $eq: ['$_id', '$$userId'] }] } } },
                                        {
                                            $project: {
                                                fullname: 1,
                                                profilePhoto: 1,
                                                profilePhotoThumbnail: 1,
                                                designation: 1,
                                                collegeId: 1,
                                                role: 1,
                                            },
                                        },
                                        {
                                            $lookup: {
                                                from: 'colleges',
                                                let: { collegeId: '$collegeId' },
                                                pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$collegeId'] }] } } }, { $project: { title: 1 } }],
                                                as: 'collegeId',
                                            },
                                        },
                                        { $unwind: { path: '$collegeId', preserveNullAndEmptyArrays: true } },
                                    ],
                                    as: 'user',
                                },
                            },
                            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                            {
                                $lookup: {
                                    from: 'employer-admins',
                                    let: { employerAdminId: '$employerAdmin' },
                                    pipeline: [
                                        { $match: { $expr: { $and: [{ $eq: ['$_id', '$$employerAdminId'] }] } } },
                                        {
                                            $project: {
                                                fullname: 1,
                                                profilePhoto: 1,
                                                profilePhotoThumbnail: 1,
                                                designation: 1,
                                                employerId: 1,
                                            },
                                        },
                                        {
                                            $lookup: {
                                                from: 'employer-companies',
                                                let: { employerId: '$employerId' },
                                                pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$_id', '$$employerId'] }] } } }, { $project: { title: 1 } }],
                                                as: 'employerId',
                                            },
                                        },
                                        { $unwind: { path: '$employerId', preserveNullAndEmptyArrays: true } },
                                    ],
                                    as: 'employerAdmin',
                                },
                            },
                            { $unwind: { path: '$employerAdmin', preserveNullAndEmptyArrays: true } },
                            { $sort: { createdAt: -1 } },
                        ],
                        as: 'replies',
                    },
                },
                { $sort: { createdAt: -1 } },
            ]),
            this.employerCommentModel.countDocuments().byPost(postId),
        ]);
        return { commentsList, totalComments };
    }
    async getRecentComments(params) {
        return await this.employerCommentModel
            .find()
            .sort({ createdAt: -1 })
            .limit(params.perPage)
            .populate({
            path: 'user',
            select: 'fullname profilePhoto profilePhotoThumbnail designation collegeId role',
            populate: { path: 'collegeId', select: 'title' },
        })
            .populate({
            path: 'employerAdmin',
            select: 'fullname profilePhoto profilePhotoThumbnail designation employerId',
            populate: { path: 'employerId', select: 'title' },
        })
            .populate('employerPost', 'topic')
            .lean();
    }
    async deletePost(postDto) {
        const postId = mongoose.Types.ObjectId(postDto.postId);
        const filter = { _id: postId };
        if (postDto.user) {
            filter.user = mongoose.Types.ObjectId(postDto.user);
        }
        else {
            filter.employerAdmin = mongoose.Types.ObjectId(postDto.employerAdmin);
        }
        if (postDto.isAdmin) {
            delete filter.user;
            delete filter.employerAdmin;
        }
        const post = await this.employerPostModel.deleteOne(filter).exec();
        if (post.deletedCount > 0) {
            await Promise.all([
                this.employerCommentModel.deleteMany({ employerPost: postId }).exec(),
            ]);
            return ResponseHandler_1.default.success({}, 'Post deleted successfully');
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.post.wrongAuthor);
        }
    }
    async deleteComment(commentDto) {
        const commentId = mongoose.Types.ObjectId(commentDto.commentId);
        const filter = { _id: commentId };
        if (commentDto.user) {
            if (!commentDto.isAdmin) {
                filter.user = mongoose.Types.ObjectId(commentDto.user);
            }
        }
        else {
            filter.employerAdmin = mongoose.Types.ObjectId(commentDto.employerAdmin);
        }
        const comment = await this.employerCommentModel.findOneAndRemove(filter).exec();
        if (comment) {
            await Promise.all([
                this.employerPostModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(comment.employerPost) }, { $inc: { totalComments: -1 } }),
            ]);
            return ResponseHandler_1.default.success({}, 'Comment deleted successfully');
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.post.editReply);
        }
    }
    async deleteReply(replyDto) {
        const replyId = mongoose.Types.ObjectId(replyDto.replyId);
        const filter = { _id: replyId };
        if (replyDto.user) {
            if (!replyDto.isAdmin) {
                filter.user = mongoose.Types.ObjectId(replyDto.user);
            }
        }
        else {
            filter.employerAdmin = mongoose.Types.ObjectId(replyDto.employerAdmin);
        }
        const reply = await this.employerReplyModel.findOneAndRemove(filter).exec();
        if (reply) {
            await Promise.all([
                this.employerCommentModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(reply.employerComment) }, { $inc: { totalReplies: -1 } }),
            ]);
            return ResponseHandler_1.default.success({}, 'Comment deleted successfully');
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.post.editReply);
        }
    }
    async getTags(keyword) {
        return await this.employerPostTagModel
            .find()
            .byKeyword(keyword)
            .sort({ title: 1 })
            .collation({ locale: 'en', strength: 2 })
            .lean()
            .exec();
    }
    async addTag(tagDto) {
        const checkTag = await this.employerPostTagModel
            .findOne({ title: tagDto.title })
            .lean()
            .exec();
        if (checkTag) {
            return ResponseHandler_1.default.fail('Tag already exist.');
        }
        let tag = new this.employerPostTagModel(tagDto);
        tag = await tag.save();
        return ResponseHandler_1.default.success(tag);
    }
    async getReports(params) {
        const { page, perPage } = params;
        const [reports, reportsCount] = await Promise.all([
            this.postReportModel
                .find()
                .sort({ updatedAt: -1 })
                .paginate(page, perPage)
                .populate({
                path: 'post',
                select: 'author topic content numId',
                populate: { path: 'author', select: 'fullname profilePhoto profilePhotoThumbnail emailAddress phoneNumber' },
            })
                .populate({
                path: 'reply',
                select: 'learner user content postId',
                populate: [
                    { path: 'learner', select: 'fullname profilePhoto profilePhotoThumbnail emailAddress phoneNumber' },
                    { path: 'user', select: 'fullname profilePhoto profilePhotoThumbnail emailAddress role collegeId' },
                    {
                        path: 'postId',
                        select: 'author topic content numId',
                        populate: { path: 'author', select: 'fullname profilePhoto profilePhotoThumbnail emailAddress phoneNumber' },
                    },
                ],
            })
                .populate('reportingUsers', 'fullname profilePhoto profilePhotoThumbnail')
                .populate('reportingUsers', 'fullname profilePhoto profilePhotoThumbnail')
                .lean()
                .exec(),
            this.postReportModel.countDocuments(),
        ]);
        return ResponseHandler_1.default.success({ reports, reportsCount });
    }
    async addReport(params) {
        const { postId, replyId, userId, learnerId } = params;
        const filter = postId ? { post: mongoose.Types.ObjectId(postId) } : { reply: mongoose.Types.ObjectId(replyId) };
        let update = {};
        if (userId) {
            update = { post: postId, reply: replyId, $addToSet: { reportingUsers: userId } };
        }
        else {
            update = { post: postId, reply: replyId, $addToSet: { reportingLearners: learnerId } };
        }
        const report = await this.postReportModel.findOneAndUpdate(filter, update, { upsert: true, new: true });
        if (report.reportingUsers.length + report.reportingLearners.length < 2) {
            await this.postReportModel.findByIdAndUpdate(report._id, { status: 'pending' }, { new: true });
        }
        return report ? ResponseHandler_1.default.success(report) : ResponseHandler_1.default.fail('Cant report.');
    }
    async updateReportStatus(params) {
        const { reportId, status } = params;
        const report = await this.postReportModel.findByIdAndUpdate(reportId, { status }, { new: true });
        if (!report) {
            return ResponseHandler_1.default.fail('Invalid reportId.');
        }
        if (status === 'deleted') {
            if (report.reply) {
                const reply = await this.employerCommentModel.findOneAndRemove({ _id: mongoose.Types.ObjectId(report.reply) }).exec();
                if (reply) {
                    await this.employerPostModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(reply.postId) }, { $inc: { totalReplies: -1, totalParticipants: -1 } });
                }
            }
            else {
                const post = await this.employerPostModel.deleteOne({ _id: mongoose.Types.ObjectId(report.post) }).exec();
                if (post.deletedCount > 0) {
                    await this.employerCommentModel.deleteMany({ postId: mongoose.Types.ObjectId(report.post) });
                }
            }
            await this.postReportModel.findOneAndRemove({ _id: mongoose.Types.ObjectId(reportId) }).exec();
            return ResponseHandler_1.default.success({}, report.reply ? 'Reply removed successfully.' : 'Post removed successfully.');
        }
        return ResponseHandler_1.default.success({ report });
    }
};
EmployerPostsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('employer-posts')),
    __param(1, mongoose_1.InjectModel('employer-comments')),
    __param(2, mongoose_1.InjectModel('employer-replies')),
    __param(3, mongoose_1.InjectModel('employer-post-tags')),
    __param(4, mongoose_1.InjectModel('employer-post-reports')),
    __param(5, mongoose_1.InjectModel('id-counters')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, notifications_service_1.NotificationsService])
], EmployerPostsService);
exports.EmployerPostsService = EmployerPostsService;
//# sourceMappingURL=employer-forums.service.js.map