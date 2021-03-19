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
const config_1 = require("../config/config");
const mongoose = require("mongoose");
const notifications_service_1 = require("../notifications/notifications.service");
let InternalChatService = class InternalChatService {
    constructor(chatGroupModel, chatMessagesModel, notificationsService) {
        this.chatGroupModel = chatGroupModel;
        this.chatMessagesModel = chatMessagesModel;
        this.notificationsService = notificationsService;
    }
    async getChatGroups(userId) {
        const groups = await this.chatGroupModel.aggregate([
            {
                $match: { members: mongoose.Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members',
                    foreignField: '_id',
                    as: 'members',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy',
                },
            },
            { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'chat-messages',
                    let: { chatId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$chatId', '$$chatId'] }] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                        {
                            $project: {
                                createdAt: 1,
                                hasUnreadMessages: {
                                    $cond: [{ $gt: [{ $size: { $setIntersection: ['$readBy', [mongoose.Types.ObjectId(userId)]] } }, 0] }, false, true],
                                },
                            },
                        },
                    ],
                    as: 'recentMessage',
                },
            },
            { $unwind: { path: '$recentMessage', preserveNullAndEmptyArrays: true } },
            { $sort: { 'recentMessage.createdAt': -1 } },
            {
                $project: {
                    groupName: 1,
                    groupPhoto: 1,
                    'createdBy.fullname': 1,
                    'createdBy.role': 1,
                    'createdBy.profilePhoto': 1,
                    'createdBy.profilePhotoThumbnail': 1,
                    'members.fullname': 1,
                    'members.role': 1,
                    'members.profilePhoto': 1,
                    'members.profilePhotoThumbnail': 1,
                    createdAt: 1,
                    hasUnreadMessages: '$recentMessage.hasUnreadMessages',
                    recentMessage: 1,
                    sortTime: { $ifNull: ['$recentMessage.createdAt', '$createdAt'] },
                },
            },
            { $sort: { sortTime: -1 } },
        ]);
        return ResponseHandler_1.default.success(groups);
    }
    async getMessages(params) {
        const { chatId, page, perPage, userId } = params;
        const chat = await this.chatGroupModel
            .findOne({
            _id: mongoose.Types.ObjectId(chatId),
            members: mongoose.Types.ObjectId(userId),
        })
            .lean()
            .exec();
        if (!chat) {
            return ResponseHandler_1.default.fail('You are not part of this chat.');
        }
        const messages = await this.chatMessagesModel
            .find({ chatId: mongoose.Types.ObjectId(chatId) })
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('from', 'fullname profilePhoto profilePhotoThumbnail')
            .lean()
            .exec();
        const messageIds = messages.map(message => message._id);
        await this.chatMessagesModel.updateMany({ _id: { $in: messageIds } }, { $addToSet: { readBy: userId } }, { multi: true, upsert: false });
        return ResponseHandler_1.default.success({ messages, userId });
    }
    async createChatGroup(chatGroupData) {
        let chatGroup = await this.chatGroupModel.create(chatGroupData);
        chatGroup = await chatGroup
            .populate('members', 'fullname profilePhoto profilePhotoThumbnail role')
            .populate('createdBy', 'fullname profilePhoto profilePhotoThumbnail role')
            .execPopulate();
        this.notificationsService.newChat(chatGroup, chatGroupData.members);
        chatGroup.members.forEach(member => {
            config_1.pusher.trigger(`new-chat-group-${member._id}`, 'new-chat-group', chatGroup);
        });
        return ResponseHandler_1.default.success(chatGroup);
    }
    async sendMessage(messageData) {
        messageData.readBy = [messageData.from];
        let message = await this.chatMessagesModel.create(messageData);
        message = await message
            .populate('from', 'fullname profilePhoto profilePhotoThumbnail')
            .populate('chatId')
            .execPopulate();
        this.notificationsService.newMessage(message);
        config_1.pusher.trigger(`internal-chat-${messageData.chatId}`, 'new-message', message);
        return ResponseHandler_1.default.success(message);
    }
    async addMembers(addMembersData) {
        const { members, chatId } = addMembersData;
        let chatGroup = await this.chatGroupModel.findByIdAndUpdate(chatId, { $addToSet: { members: { $each: members } } }, { new: true });
        chatGroup = await chatGroup
            .populate('members', 'fullname profilePhoto profilePhotoThumbnail role')
            .populate('createdBy', 'fullname profilePhoto profilePhotoThumbnail role')
            .execPopulate();
        this.notificationsService.newChat(chatGroup, members);
        members.forEach(member => {
            config_1.pusher.trigger(`new-chat-group-${member}`, 'new-chat-group', chatGroup);
        });
        return ResponseHandler_1.default.success(chatGroup, 'Members added successfully.');
    }
    async getChatGroupDetail(params) {
        const { chatId, userId } = params;
        const chatGroup = await this.chatGroupModel
            .findOne({
            _id: mongoose.Types.ObjectId(chatId),
            members: mongoose.Types.ObjectId(userId),
        })
            .populate('members', 'fullname profilePhoto profilePhotoThumbnail role')
            .populate('createdBy', 'fullname profilePhoto profilePhotoThumbnail role')
            .lean()
            .exec();
        if (!chatGroup) {
            return ResponseHandler_1.default.fail('You are not part of this chat.');
        }
        return ResponseHandler_1.default.success(chatGroup);
    }
    async updateReadBy(updateMessage) {
        const { messageId, userId } = updateMessage;
        const update = await this.chatMessagesModel.findByIdAndUpdate(messageId, { $push: { readBy: userId } }, { new: true });
        return ResponseHandler_1.default.success({}, 'readBy updated succesfully.');
    }
};
InternalChatService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('chat-groups')),
    __param(1, mongoose_1.InjectModel('chat-messages')),
    __metadata("design:paramtypes", [Object, Object, notifications_service_1.NotificationsService])
], InternalChatService);
exports.InternalChatService = InternalChatService;
//# sourceMappingURL=internal-chat.service.js.map