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
let PostsService = class PostsService {
    constructor(postModel, replyModel, postTagModel, postReportModel, counterModel) {
        this.postModel = postModel;
        this.replyModel = replyModel;
        this.postTagModel = postTagModel;
        this.postReportModel = postReportModel;
        this.counterModel = counterModel;
    }
    async getTotalPostAndParticipants() {
        const [totalParticipants, totalPosts] = await Promise.all([
            this.replyModel.aggregate([
                {
                    $addFields: {
                        participant: {
                            $ifNull: ['$user', '$learner'],
                        },
                    },
                },
                {
                    $group: {
                        _id: '$participant',
                    },
                },
            ]),
            this.postModel.countDocuments(),
        ]);
        return { totalParticipants: totalParticipants.length, totalPosts };
    }
    async createPost(postDto) {
        const counter = await this.counterModel.findOneAndUpdate({}, { $inc: { post: 1 } }, { new: true, upsert: true }).lean();
        postDto.numId = counter.post;
        if (postDto.stringTags && postDto.stringTags.length > 0) {
            const promises = postDto.stringTags.map(tag => {
                return this.postTagModel.findOneAndUpdate({ title: tag }, { title: tag }, { upsert: true, new: true });
            });
            const newTags = await Promise.all(promises);
            postDto.tags = postDto.tags && postDto.tags.length > 0 ? postDto.tags : [];
            newTags.forEach(tag => postDto.tags.push(tag._id));
        }
        const post = await this.postModel.create(postDto);
        return ResponseHandler_1.default.success(post);
    }
    async editPost(postDto, learner) {
        const postId = mongoose.Types.ObjectId(postDto.postId);
        learner = mongoose.Types.ObjectId(learner);
        const post = await this.postModel.findOneAndUpdate({ _id: postId, author: learner }, postDto, { new: true });
        if (post) {
            return ResponseHandler_1.default.success(post);
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.post.wrongAuthor);
        }
    }
    async getPosts(params) {
        const { keyword, page, perPage, popular } = params;
        const sortObj = popular ? { totalReplies: -1, createdAt: -1 } : { createdAt: -1 };
        const [postList, totalPosts] = await Promise.all([
            this.postModel
                .find()
                .byTopic(keyword)
                .sort(sortObj)
                .paginate(page, perPage)
                .lean(),
            this.postModel.countDocuments().byTopic(keyword),
        ]);
        return { postList, totalPosts };
    }
    async getPostById(postId) {
        return await this.postModel
            .findById(postId)
            .populate('author', 'fullname profilePhoto profilePhotoThumbnail')
            .populate('tags')
            .lean();
    }
    async getPostByNumId(numId) {
        return await this.postModel
            .findOne({ numId: Number(numId) })
            .populate('author', 'fullname profilePhoto profilePhotoThumbnail')
            .populate('tags')
            .lean();
    }
    async addReply(replyDto) {
        let reply = new this.replyModel(replyDto);
        let filter = {};
        let update = {};
        if (replyDto.user) {
            filter = { user: mongoose.Types.ObjectId(replyDto.user) };
        }
        else {
            filter = { learner: mongoose.Types.ObjectId(replyDto.learner) };
        }
        filter.postId = mongoose.Types.ObjectId(replyDto.postId);
        const userPrevReplies = await this.replyModel.findOne(filter).lean();
        reply = await reply.save();
        if (userPrevReplies) {
            update = { $inc: { totalReplies: 1 } };
        }
        else {
            update = { $inc: { totalReplies: 1, totalParticipants: 1 } };
        }
        await this.postModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(replyDto.postId) }, update);
        return ResponseHandler_1.default.success(reply);
    }
    async editReply(replyDto) {
        const replyId = mongoose.Types.ObjectId(replyDto.replyId);
        const filter = { _id: replyId };
        if (replyDto.user) {
            filter.user = mongoose.Types.ObjectId(replyDto.user);
        }
        else {
            filter.learner = mongoose.Types.ObjectId(replyDto.learner);
        }
        const reply = await this.replyModel.findOneAndUpdate(filter, replyDto, { new: true });
        if (reply) {
            return ResponseHandler_1.default.success(reply);
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.post.editReply);
        }
    }
    async getReplies(params) {
        const { page, perPage, postId } = params;
        const [repliesList, totalReplies] = await Promise.all([
            this.replyModel
                .find()
                .byPost(postId)
                .sort({ createdAt: -1 })
                .paginate(page, perPage)
                .populate('user', 'fullname profilePhoto profilePhotoThumbnail collegeId role')
                .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
                .lean(),
            this.replyModel.countDocuments().byPost(postId),
        ]);
        return { repliesList, totalReplies };
    }
    async getRecentReplies(params) {
        return await this.replyModel
            .find()
            .sort({ createdAt: -1 })
            .limit(params.perPage)
            .populate('user', 'fullname profilePhoto profilePhotoThumbnail collegeId')
            .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
            .populate('postId', 'topic numId')
            .lean();
    }
    async deletePost(postDto) {
        const postId = mongoose.Types.ObjectId(postDto.postId);
        const filter = { _id: postId, author: mongoose.Types.ObjectId(postDto.learner) };
        if (postDto.isAdmin) {
            delete filter.author;
        }
        const post = await this.postModel.deleteOne(filter).exec();
        if (post.deletedCount > 0) {
            await Promise.all([this.replyModel.deleteMany({ postId }).exec(), this.postReportModel.deleteOne({ post: postId }).exec()]);
            return ResponseHandler_1.default.success({}, 'Post deleted successfully');
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.post.wrongAuthor);
        }
    }
    async deleteReply(replyDto) {
        const replyId = mongoose.Types.ObjectId(replyDto.replyId);
        const filter = { _id: replyId };
        let countReplies = 0;
        if (replyDto.user) {
            if (!replyDto.isAdmin) {
                filter.user = mongoose.Types.ObjectId(replyDto.user);
                countReplies = await this.replyModel.countDocuments({ user: mongoose.Types.ObjectId(replyDto.user) });
            }
            else {
                const replyObj = await this.replyModel
                    .findOne({ _id: replyId }, 'user learner')
                    .lean()
                    .exec();
                const countFilter = replyObj.user
                    ? { user: mongoose.Types.ObjectId(replyObj.user) }
                    : { learner: mongoose.Types.ObjectId(replyObj.learner) };
                countReplies = await this.replyModel.countDocuments(countFilter);
            }
        }
        else {
            filter.learner = mongoose.Types.ObjectId(replyDto.learner);
            countReplies = await this.replyModel.countDocuments({ user: mongoose.Types.ObjectId(replyDto.learner) });
        }
        const reply = await this.replyModel.findOneAndRemove(filter).exec();
        if (reply) {
            await Promise.all([
                this.postModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(reply.postId) }, { $inc: { totalReplies: -1, totalParticipants: countReplies > 1 ? 0 : -1 } }),
                this.postReportModel.findOneAndRemove({ reply: replyId }).exec(),
            ]);
            return ResponseHandler_1.default.success({}, 'Reply deleted successfully');
        }
        else {
            return ResponseHandler_1.default.fail(responseMessages_1.default.post.editReply);
        }
    }
    async getTags() {
        return await this.postTagModel
            .find()
            .sort({ title: 1 })
            .collation({ locale: 'en', strength: 2 })
            .lean();
    }
    async addTag(tagDto) {
        let tag = new this.postTagModel(tagDto);
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
                const reply = await this.replyModel.findOneAndRemove({ _id: mongoose.Types.ObjectId(report.reply) }).exec();
                if (reply) {
                    await this.postModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(reply.postId) }, { $inc: { totalReplies: -1, totalParticipants: -1 } });
                }
            }
            else {
                const post = await this.postModel.deleteOne({ _id: mongoose.Types.ObjectId(report.post) }).exec();
                if (post.deletedCount > 0) {
                    await this.replyModel.deleteMany({ postId: mongoose.Types.ObjectId(report.post) });
                }
            }
            await this.postReportModel.findOneAndRemove({ _id: mongoose.Types.ObjectId(reportId) }).exec();
            return ResponseHandler_1.default.success({}, report.reply ? 'Reply removed successfully.' : 'Post removed successfully.');
        }
        return ResponseHandler_1.default.success({ report });
    }
};
PostsService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('posts')),
    __param(1, mongoose_1.InjectModel('replies')),
    __param(2, mongoose_1.InjectModel('post-tags')),
    __param(3, mongoose_1.InjectModel('post-reports')),
    __param(4, mongoose_1.InjectModel('id-counters')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], PostsService);
exports.PostsService = PostsService;
//# sourceMappingURL=posts.service.js.map