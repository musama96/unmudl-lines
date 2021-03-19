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
const notifications_service_1 = require("../notifications/notifications.service");
let ContactCollegeResponsesService = class ContactCollegeResponsesService {
    constructor(contactCollegeResponseModel, messageModel, employerAdminModel, userModel, learnerModel, notificationsService) {
        this.contactCollegeResponseModel = contactCollegeResponseModel;
        this.messageModel = messageModel;
        this.employerAdminModel = employerAdminModel;
        this.userModel = userModel;
        this.learnerModel = learnerModel;
        this.notificationsService = notificationsService;
    }
    async getProposalResponses(params) {
        var _a;
        const { page, perPage, keyword, userId, employerAdminId, proposals, employerAdminRole, employerId } = params;
        const proposalMatch = {
            'proposal.title': {
                $regex: keyword,
                $options: 'i',
            },
            'proposal.deletedAt': null,
        };
        if (employerAdminId) {
            if (employerAdminRole !== 'system') {
                proposalMatch['$or'] = [
                    { 'proposal.showToEmployerAdmins': mongoose.Types.ObjectId(employerAdminId) },
                    { 'proposal.addedBy': mongoose.Types.ObjectId(employerAdminId) },
                ];
            }
            else {
                proposalMatch['proposal.employer'] = mongoose.Types.ObjectId(employerId);
            }
        }
        const match = {
            proposal: ((_a = proposals) === null || _a === void 0 ? void 0 : _a.length) > 0 ? { $in: proposals.map(proposal => mongoose.Types.ObjectId(proposal)) } : { $ne: null },
            appliedBy: { $ne: null },
            proposedBy: { $ne: null },
            chat: { $ne: null },
        };
        if (userId) {
            match['$or'] = [{ users: mongoose.Types.ObjectId(userId) }, { appliedBy: mongoose.Types.ObjectId(userId) }];
        }
        const pipeline = [];
        const rowsPipeline = [];
        pipeline.push({ $match: match });
        rowsPipeline.push({ $match: match });
        pipeline.push(...[
            {
                $lookup: {
                    from: 'contact-college-proposals',
                    localField: 'proposal',
                    foreignField: '_id',
                    as: 'proposal',
                },
            },
            { $unwind: '$proposal' },
            { $match: proposalMatch },
            {
                $lookup: {
                    from: 'chats',
                    localField: 'chat',
                    foreignField: '_id',
                    as: 'chat',
                },
            },
            { $unwind: { path: '$chat', preserveNullAndEmptyArrays: true } },
            { $match: { chat: { $ne: null } } },
        ]);
        const unreadMessagesCountPipeline = [...pipeline];
        pipeline.push(...[
            {
                $lookup: {
                    from: 'colleges',
                    localField: 'college',
                    foreignField: '_id',
                    as: 'college',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'appliedBy',
                    foreignField: '_id',
                    as: 'appliedBy',
                },
            },
            {
                $lookup: {
                    from: 'employer-admins',
                    localField: 'proposedBy',
                    foreignField: '_id',
                    as: 'proposedBy',
                },
            },
            { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$appliedBy', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$proposedBy', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'employer-companies',
                    localField: 'proposedBy.employerId',
                    foreignField: '_id',
                    as: 'employer',
                },
            },
            {
                $lookup: {
                    from: 'messages',
                    let: { chatId: '$chat._id' },
                    pipeline: [{ $match: { $expr: { $eq: ['$$chatId', '$chat'] } } }, { $sort: { createdAt: -1 } }, { $limit: 1 }],
                    as: 'latestMessage',
                },
            },
            { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$latestMessage', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    sortDate: {
                        $cond: { if: '$latestMessage', then: '$latestMessage.createdAt', else: '$chat.createdAt' },
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'users',
                    foreignField: '_id',
                    as: 'users',
                },
            },
            {
                $sort: { sortDate: -1 },
            },
        ]);
        const responses = await this.contactCollegeResponseModel
            .aggregate(pipeline)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        rowsPipeline.push(...[
            {
                $lookup: {
                    from: 'contact-college-proposals',
                    localField: 'proposal',
                    foreignField: '_id',
                    as: 'proposal',
                },
            },
            { $unwind: '$proposal' },
            { $match: proposalMatch },
            {
                $lookup: {
                    from: 'chats',
                    localField: 'chat',
                    foreignField: '_id',
                    as: 'chat',
                },
            },
            { $unwind: { path: '$chat', preserveNullAndEmptyArrays: true } },
            { $match: { chat: { $ne: null } } },
        ]);
        rowsPipeline.push({
            $group: {
                _id: null,
                rows: { $sum: 1 },
            },
        });
        const rows = await this.contactCollegeResponseModel.aggregate(rowsPipeline).exec();
        unreadMessagesCountPipeline.push(...[
            {
                $addFields: {
                    readByEmployerAdmins: {
                        $cond: {
                            if: '$chat.readByEmployerAdmins',
                            then: '$chat.readByEmployerAdmins',
                            else: [],
                        },
                    },
                    readByUsers: {
                        $cond: {
                            if: '$chat.readByUsers',
                            then: '$chat.readByUsers',
                            else: [],
                        },
                    },
                },
            },
            {
                $addFields: {
                    isUnRead: {
                        $cond: {
                            if: {
                                $in: employerAdminId
                                    ? [mongoose.Types.ObjectId(employerAdminId), '$readByEmployerAdmins']
                                    : [mongoose.Types.ObjectId(userId), '$readByUsers'],
                            },
                            then: false,
                            else: true,
                        },
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    unreadMessagesCount: { $sum: { $cond: { if: '$isUnRead', then: 1, else: 0 } } },
                },
            },
        ]);
        const unreadMessagesCount = await this.contactCollegeResponseModel.aggregate(unreadMessagesCountPipeline).exec();
        return ResponseHandler_1.default.success({
            responses,
            rows: rows.length > 0 ? rows[0].rows : 0,
            unreadMessagesCount: unreadMessagesCount.length > 0 ? unreadMessagesCount[0].unreadMessagesCount : 0,
        });
    }
    async getProposalResponseDetails(responseId) {
        const tempResponse = await this.contactCollegeResponseModel
            .aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(responseId),
                },
            },
            {
                $lookup: {
                    from: 'contact-college-proposals',
                    localField: 'proposal',
                    foreignField: '_id',
                    as: 'proposal',
                },
            },
            {
                $lookup: {
                    from: 'colleges',
                    localField: 'college',
                    foreignField: '_id',
                    as: 'college',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'appliedBy',
                    foreignField: '_id',
                    as: 'appliedBy',
                },
            },
            {
                $lookup: {
                    from: 'employer-admins',
                    localField: 'proposedBy',
                    foreignField: '_id',
                    as: 'proposedBy',
                },
            },
            {
                $lookup: {
                    from: 'chats',
                    localField: 'chat',
                    foreignField: '_id',
                    as: 'chat',
                },
            },
            { $unwind: { path: '$chat', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$proposal', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$appliedBy', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$proposedBy', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'contact-college-categories',
                    localField: 'proposal.category',
                    foreignField: '_id',
                    as: 'proposalCategory',
                },
            },
            {
                $lookup: {
                    from: 'employer-companies',
                    localField: 'proposedBy.employerId',
                    foreignField: '_id',
                    as: 'employer',
                },
            },
            {
                $lookup: {
                    from: 'messages',
                    let: { chatId: '$chat._id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$$chatId', '$chat'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 10 },
                        { $sort: { createdAt: 1 } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user',
                                foreignField: '_id',
                                as: 'user',
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
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$employerAdmin', preserveNullAndEmptyArrays: true } },
                    ],
                    as: 'messages',
                },
            },
            { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$latestMessage', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$proposalCategory', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'users',
                    foreignField: '_id',
                    as: 'users',
                },
            },
        ])
            .exec();
        const response = tempResponse && tempResponse.length > 0 ? tempResponse[0] : null;
        if (response.chat && response.chat.createdBy) {
            switch (response.chat.createdByType) {
                case 'employerAdmin':
                    response.chat.createdBy = await this.employerAdminModel.findById(response.chat.createdBy).lean();
                    break;
                case 'user':
                    response.chat.createdBy = await this.userModel.findById(response.chat.createdBy).lean();
                    break;
                case 'learner':
                    response.chat.createdBy = await this.learnerModel.findById(response.chat.createdBy).lean();
                    break;
            }
        }
        if (response) {
            response.messages = {
                messages: response.messages,
                rows: response.chat ? await this.messageModel.countDocuments({ chat: response.chat._id }).exec() : 0,
            };
        }
        return ResponseHandler_1.default.success(response);
    }
    async createProposalResponse(response, employer) {
        const oldProposalResponse = await this.contactCollegeResponseModel
            .findOne({ proposal: response.proposal, college: response.college })
            .lean();
        if (oldProposalResponse) {
            return ResponseHandler_1.default.fail('Could not submit the proposal response. A response to this proposal has already been submitted by your college.');
        }
        let newResponse = await this.contactCollegeResponseModel.create(response);
        newResponse = await newResponse
            .populate('proposedBy', '_id employerId')
            .populate('proposal', 'title')
            .execPopulate();
        this.notificationsService.newProposalResponse(newResponse);
        return ResponseHandler_1.default.success(newResponse, 'Response to the proposal request submitted successfully.');
    }
};
ContactCollegeResponsesService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('contact-college-responses')),
    __param(1, mongoose_1.InjectModel('messages')),
    __param(2, mongoose_1.InjectModel('employer-admins')),
    __param(3, mongoose_1.InjectModel('users')),
    __param(4, mongoose_1.InjectModel('learners')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, notifications_service_1.NotificationsService])
], ContactCollegeResponsesService);
exports.ContactCollegeResponsesService = ContactCollegeResponsesService;
//# sourceMappingURL=contact-college-responses.service.js.map