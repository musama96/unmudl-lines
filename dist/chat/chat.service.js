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
const chatList_dto_1 = require("./dto/chatList.dto");
const config_1 = require("../config/config");
const notifications_service_1 = require("../notifications/notifications.service");
const mongoose = require("mongoose");
const ResponseHandler_1 = require("../common/ResponseHandler");
const chat_model_1 = require("./chat.model");
let ChatService = class ChatService {
    constructor(chatModel, messageModel, userModel, employerAdminModel, notificationsService) {
        this.chatModel = chatModel;
        this.messageModel = messageModel;
        this.userModel = userModel;
        this.employerAdminModel = employerAdminModel;
        this.notificationsService = notificationsService;
    }
    async addChat(chat) {
        let newChat = new this.chatModel(chat);
        newChat = await newChat.save();
        const chatObj = await this.chatModel.aggregate([
            { $match: { _id: newChat._id } },
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
                    from: 'colleges',
                    localField: 'college',
                    foreignField: '_id',
                    as: 'college',
                },
            },
            { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'employers',
                    localField: 'employer',
                    foreignField: '_id',
                    as: 'employer',
                },
            },
            { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: '$users' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $in: ['$_id', '$$userId'] }] } } },
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
                    as: 'users',
                },
            },
            {
                $lookup: {
                    from: 'employer-admins',
                    let: { employerAdminId: '$employerAdmins' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $in: ['$_id', '$$employerAdminId'] }] } } },
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
                    as: 'employerAdmins',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: '$createdBy' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$_id', '$$userId'] }] } } },
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
                    as: 'creatingUser',
                },
            },
            { $unwind: { path: '$creatingUser', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'employer-admins',
                    let: { employerAdminId: '$createdBy' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$_id', '$$employerAdminId'] }] } } },
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
                    as: 'creatingEmployer',
                },
            },
            { $unwind: { path: '$creatingEmployer', preserveNullAndEmptyArrays: true } },
            { $addFields: { createdBy: { $ifNull: ['$creatingUser', '$creatingEmployer'] } } },
            { $unset: ['creatingUser', 'creatingEmployer'] },
        ]);
        newChat = chatObj[0];
        if (newChat.module !== 'employer-proposal-response') {
            chat._id = newChat._id;
            (() => this.notificationsService.newGenericChat(chat))();
            if (newChat.module !== 'source-talent') {
                chat.employerAdmins.forEach(member => {
                    config_1.pusher.trigger(`new-chat-${member}`, 'new-chat', newChat);
                });
                chat.users.forEach(member => {
                    config_1.pusher.trigger(`new-chat-${member}`, 'new-chat', newChat);
                });
                if (chat.learner) {
                    config_1.pusher.trigger(`new-chat-${chat.learner}`, 'new-chat', newChat);
                }
            }
        }
        return ResponseHandler_1.default.success(newChat, 'Chat created successfully.');
    }
    async getChatDetails(id, user) {
        const { _id: userId, type } = user;
        switch (type) {
            case 'user':
                await this.chatModel
                    .findByIdAndUpdate(id, {
                    $addToSet: {
                        readByUsers: userId,
                    },
                })
                    .exec();
                break;
            case 'learner':
                await this.chatModel
                    .findByIdAndUpdate(id, {
                    $set: {
                        readByLearner: true,
                    },
                })
                    .exec();
                break;
            case 'employer':
                await this.chatModel
                    .findByIdAndUpdate(id, {
                    $addToSet: {
                        readByEmployerAdmins: userId,
                    },
                })
                    .exec();
                break;
        }
        const [chat, messages] = await Promise.all([
            this.chatModel
                .findById(id)
                .populate('learner')
                .populate({ path: 'employerAdmins', populate: 'employerId' })
                .populate({ path: 'users', populate: 'collegeId' })
                .populate('course')
                .populate('college')
                .populate('employer')
                .exec(),
            this.messageModel
                .find({ chat: id })
                .sort({ createdAt: -1 })
                .skip(0)
                .limit(10)
                .populate({ path: 'employerAdmin', populate: 'employerId' })
                .populate('learner')
                .populate({ path: 'user', populate: 'collegeId' })
                .exec(),
        ]);
        const find = {
            deletedAt: null,
            module: chat.module,
        };
        let unreadChatsMatch = null;
        switch (type) {
            case 'learner':
                find.learner = userId;
                unreadChatsMatch = {
                    readByLearner: { $ne: true },
                };
                break;
            case 'employer':
                find.$or = [{ employerAdmins: userId }];
                unreadChatsMatch = {
                    readByEmployerAdmins: {
                        $nin: [userId],
                    },
                };
                break;
            case 'user':
                find.$or = [{ users: userId }];
                unreadChatsMatch = {
                    readByUsers: {
                        $nin: [userId],
                    },
                };
                break;
        }
        const unreadChats = await this.chatModel
            .aggregate([
            { $match: find },
            {
                $addFields: {
                    isCreator: { $cond: { if: { $eq: ['$createdBy', userId] }, then: true, else: false } },
                },
            },
            {
                $match: {
                    $or: [{ isCreator: false }, { $and: [{ isCreator: true, showToCreator: { $in: [true, null] } }] }],
                },
            },
            { $match: unreadChatsMatch },
            { $group: { _id: null, unreadChats: { $sum: 1 } } },
        ])
            .exec();
        return ResponseHandler_1.default.success({ chat, messages, unreadChats: unreadChats && unreadChats.length > 0 ? unreadChats[0].unreadChats : 0 });
    }
    async deleteChat(chatId, userId) {
        const chat = await this.chatModel.deleteOne({ _id: mongoose.Types.ObjectId(chatId), createdBy: userId }).exec();
        if (chat.deletedCount > 0) {
            await this.messageModel.deleteMany({ chat: mongoose.Types.ObjectId(chatId) }).exec();
            return ResponseHandler_1.default.success({}, 'Chat deleted successfully.');
        }
        else {
            return ResponseHandler_1.default.fail('Can only delete your own chat.');
        }
    }
    async softDeleteChat(chatId) {
        await this.chatModel.findByIdAndUpdate(chatId, { $set: { deletedAt: new Date() } }, { new: true }).exec();
        return ResponseHandler_1.default.success(null, 'Chat deleted successfully.');
    }
    async updateChatModuleDocumentId(chatId, documentId) {
        const chat = await this.chatModel.findByIdAndUpdate(chatId, { $set: { moduleDocumentId: documentId } }, { new: true }).exec();
        return ResponseHandler_1.default.success(chat, 'Chat updated successfully');
    }
    async addChatReply(reply) {
        let newMessage = new this.messageModel(reply);
        newMessage = await newMessage.save();
        newMessage = await newMessage
            .populate({ path: 'employerAdmin', populate: 'employerId' })
            .populate('learner')
            .populate({ path: 'user', populate: 'collegeId' })
            .execPopulate();
        const testMessage = newMessage.toObject();
        testMessage.createdAt = testMessage.createdAt.toISOString();
        config_1.pusher.trigger(`chat-${reply.chat}`, 'new-message', testMessage);
        await this.chatModel
            .findByIdAndUpdate(reply.chat, {
            $set: {
                readByLearner: !!reply.learner,
                readByEmployerAdmins: reply.employerAdmin ? [reply.employerAdmin] : [],
                readByUsers: reply.user ? [reply.user] : [],
            },
        }, { new: true })
            .exec();
        const [chat, messagesCount] = await Promise.all([
            this.chatModel
                .findById(reply.chat)
                .populate('learner')
                .populate('employerAdmins')
                .populate('users')
                .exec(),
            this.messageModel.countDocuments({ chat: mongoose.Types.ObjectId(reply.chat) }).exec(),
        ]);
        if ((chat.module !== 'employer-proposal-response' || (chat.module === 'employer-proposal-response' && messagesCount > 1)) &&
            (chat.module !== 'source-talent' || (chat.module === 'source-talent' && messagesCount > 1))) {
            (() => this.notificationsService.newChatMessage(chat, newMessage))();
        }
        return ResponseHandler_1.default.success(newMessage);
    }
    async addMembersToChat({ chatId, users, learner, employerAdmins, replaceExistingEmployerAdmins, replaceExistingUsers }) {
        const update = {};
        if (employerAdmins && employerAdmins.length > 0) {
            if (replaceExistingEmployerAdmins) {
                update.employerAdmins = employerAdmins;
            }
            else {
                if (!update.$addToSet) {
                    update.$addToSet = {};
                }
                update.$addToSet.employerAdmins = replaceExistingEmployerAdmins ? employerAdmins : { $each: employerAdmins };
            }
        }
        if (users && users.length > 0) {
            if (replaceExistingUsers) {
                update.users = users;
            }
            else {
                if (!update.$addToSet) {
                    update.$addToSet = {};
                }
                update.$addToSet.users = replaceExistingUsers ? users : { $each: users };
            }
        }
        if (learner) {
            update.learner = learner;
        }
        await this.chatModel.findByIdAndUpdate(chatId, update).exec();
        const chat = await this.chatModel
            .findById(chatId)
            .populate('learner')
            .populate('employerAdmins')
            .populate('users')
            .exec();
        let found = false;
        if (chat.learner && chat.learner._id.toString() === chat.createdBy.toString()) {
            chat.createdBy = chat.learner;
            found = true;
        }
        else {
            chat.employerAdmins.forEach(admin => {
                if (!found && admin._id.toString() === chat.createdBy.toString()) {
                    chat.createdBy = admin;
                    found = true;
                }
            });
            if (!found) {
                chat.users.forEach(admin => {
                    if (!found && admin._id.toString() === chat.createdBy.toString()) {
                        chat.createdBy = admin;
                        found = true;
                    }
                });
            }
        }
        if (chat.createdBy && chat.createdBy._id) {
            (() => this.notificationsService.newMembersInChat(chat, { users, learner, employerAdmins }))();
        }
        if (employerAdmins && employerAdmins.length > 0) {
            employerAdmins.forEach(member => {
                config_1.pusher.trigger(`new-chat-${member}`, 'new-chat', chat);
            });
        }
        if (users && users.length > 0) {
            users.forEach(member => {
                config_1.pusher.trigger(`new-chat-${member}`, 'new-chat', chat);
            });
        }
        if (learner) {
            config_1.pusher.trigger(`new-chat-${learner}`, 'new-chat', chat);
        }
        return ResponseHandler_1.default.success(chat, 'Members added to the chat successfully.');
    }
    async initializeContactUnmudlChats(user) {
        const unmudlAdmins = await this.userModel
            .find({
            invitation: 'accepted',
            isSuspended: { $ne: true },
            collegeId: null,
        })
            .lean();
        const newChats = await Promise.all(unmudlAdmins.map(async (admin) => {
            const chat = {
                createdBy: admin._id,
                createdByType: 'user',
                type: chat_model_1.ChatType.EMPLOYER,
                employerAdmins: [user._id],
                employer: user.employerId,
                showToCreator: false,
                module: chatList_dto_1.ChatModuleEnum.INTERNAL_CHAT,
                users: [admin._id],
            };
            const { data: newChat } = await this.addChat(chat);
            return newChat;
        }));
        return ResponseHandler_1.default.success(newChats);
    }
    async getChatsForAUser(params, user) {
        const { type, _id, collegeId, employerId, archivedChats, role } = user;
        const { perPage, page, sortBy, sortOrder, archive, module, moduleDocumentIds, keyword } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const find = {
            deletedAt: null,
        };
        if (keyword) {
            find.groupName = {
                $regex: keyword,
                $options: 'i',
            };
        }
        find._id = archive
            ? { $in: archivedChats && archivedChats.length > 0 ? archivedChats : [] }
            : { $nin: archivedChats && archivedChats.length > 0 ? archivedChats : [] };
        if (module) {
            find.module = module !== 'internal-chat' ? module : { $in: ['internal-chat', '', null] };
        }
        if (moduleDocumentIds.length > 0) {
            find.moduleDocumentId = { $in: moduleDocumentIds.map(id => mongoose.Types.ObjectId(id)) };
        }
        let unreadChatsMatch = null;
        switch (type) {
            case 'learner':
                find.learner = _id;
                unreadChatsMatch = {
                    readByLearner: { $ne: true },
                };
                break;
            case 'employer':
                find.$or = role !== 'system' ? [{ employerAdmins: _id }] : [{ employer: employerId }];
                unreadChatsMatch = {
                    readByEmployerAdmins: {
                        $nin: [_id],
                    },
                };
                break;
            case 'user':
                find.$or = role !== 'system' ? [{ users: _id }] : [{ college: collegeId }];
                unreadChatsMatch = {
                    readByUsers: {
                        $nin: [_id],
                    },
                };
                break;
        }
        const [chats, rows, unreadChats] = await Promise.all([
            this.chatModel
                .aggregate([
                { $match: find },
                {
                    $addFields: {
                        isCreator: { $cond: { if: { $eq: ['$createdBy', _id] }, then: true, else: false } },
                    },
                },
                {
                    $match: {
                        $or: [{ isCreator: false }, { $and: [{ isCreator: true, showToCreator: { $in: [true, null] } }] }],
                    },
                },
                {
                    $lookup: {
                        from: 'messages',
                        let: { chatId: '$_id' },
                        pipeline: [{ $match: { $expr: { $eq: ['$chat', '$$chatId'] } } }, { $sort: { createdAt: -1 } }, { $limit: 1 }],
                        as: 'recentMessage',
                    },
                },
                { $unwind: { path: '$recentMessage', preserveNullAndEmptyArrays: true } },
                { $addFields: { sort: { $ifNull: ['$recentMessage.createdAt', '$createdAt'] } } },
                { $sort: { sort: -1 } },
                { $skip: (page - 1) * perPage },
                { $limit: perPage },
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
                        from: 'colleges',
                        localField: 'college',
                        foreignField: '_id',
                        as: 'college',
                    },
                },
                { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
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
                        from: 'employers',
                        localField: 'employer',
                        foreignField: '_id',
                        as: 'employer',
                    },
                },
                { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: '$users' },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $in: ['$_id', '$$userId'] }] } } },
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
                        as: 'users',
                    },
                },
                {
                    $lookup: {
                        from: 'employer-admins',
                        let: { employerAdminId: '$employerAdmins' },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $in: ['$_id', '$$employerAdminId'] }] } } },
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
                        as: 'employerAdmins',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: '$createdBy' },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ['$_id', '$$userId'] }] } } },
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
                        as: 'creatingUser',
                    },
                },
                { $unwind: { path: '$creatingUser', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'employer-admins',
                        let: { employerAdminId: '$createdBy' },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ['$_id', '$$employerAdminId'] }] } } },
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
                        as: 'creatingEmployer',
                    },
                },
                { $unwind: { path: '$creatingEmployer', preserveNullAndEmptyArrays: true } },
                { $addFields: { createdBy: { $ifNull: ['$creatingUser', '$creatingEmployer'] } } },
                { $unset: ['creatingUser', 'creatingEmployer'] },
                { $sort: { sort: -1 } },
                { $unset: 'sort' },
            ])
                .exec(),
            this.chatModel
                .aggregate([
                { $match: find },
                {
                    $addFields: {
                        isCreator: { $cond: { if: { $eq: ['$createdBy', _id] }, then: true, else: false } },
                    },
                },
                {
                    $match: {
                        $or: [{ isCreator: false }, { $and: [{ isCreator: true, showToCreator: { $in: [true, null] } }] }],
                    },
                },
                {
                    $group: {
                        _id: null,
                        rows: { $sum: 1 },
                    },
                },
            ])
                .exec(),
            this.chatModel
                .aggregate([
                { $match: find },
                {
                    $addFields: {
                        isCreator: { $cond: { if: { $eq: ['$createdBy', _id] }, then: true, else: false } },
                    },
                },
                {
                    $match: {
                        $or: [{ isCreator: false }, { $and: [{ isCreator: true, showToCreator: { $in: [true, null] } }] }],
                    },
                },
                { $match: unreadChatsMatch },
                { $group: { _id: null, unreadChats: { $sum: 1 } } },
            ])
                .exec(),
        ]);
        return ResponseHandler_1.default.success({
            chats,
            rows: rows && rows.length > 0 ? rows[0].rows : 0,
            unreadChats: unreadChats && unreadChats.length > 0 ? unreadChats[0].unreadChats : 0,
        });
    }
    async getSourceTalentChatsForAUser(params, user) {
        const { type, _id, collegeId, employerId, archivedChats } = user;
        const { perPage, page, sortBy, sortOrder, archive, myChatsOnly, keyword, type: sourceTalentType, sourceTalents } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const find = {
            deletedAt: null,
            module: 'source-talent',
        };
        if (keyword) {
            find.groupName = {
                $regex: keyword,
                $options: 'i',
            };
        }
        find._id = archive
            ? { $in: archivedChats && archivedChats.length > 0 ? archivedChats : [] }
            : { $nin: archivedChats && archivedChats.length > 0 ? archivedChats : [] };
        switch (type) {
            case 'learner':
                find.learner = _id;
                break;
            case 'employer':
                find.$or = myChatsOnly ? [{ employerAdmins: _id }] : [{ employerAdmins: _id }, { employer: employerId }];
                break;
            case 'user':
                find.$or = myChatsOnly ? [{ users: _id }] : [{ users: _id }, { college: collegeId }];
                break;
        }
        const [chats, rows] = await Promise.all([
            this.chatModel.aggregate([
                { $match: find },
                {
                    $addFields: {
                        isCreator: { $cond: { if: { $eq: ['$createdBy', _id] }, then: true, else: false } },
                    },
                },
                {
                    $match: {
                        $or: [{ isCreator: false }, { $and: [{ isCreator: true, showToCreator: { $in: [true, null] } }] }],
                    },
                },
                {
                    $lookup: {
                        from: 'source-talents',
                        localField: 'moduleDocumentId',
                        foreignField: '_id',
                        as: 'sourceTalent',
                    },
                },
                { $unwind: { path: '$sourceTalent', preserveNullAndEmptyArrays: true } },
                {
                    $match: {
                        'sourceTalent.type': sourceTalentType,
                        'sourceTalent._id': { $in: sourceTalents.map(id => mongoose.Types.ObjectId(id)) },
                    },
                },
                {
                    $lookup: {
                        from: 'messages',
                        let: { chatId: '$_id' },
                        pipeline: [{ $match: { $expr: { $eq: ['$chat', '$$chatId'] } } }, { $sort: { createdAt: -1 } }, { $limit: 1 }],
                        as: 'recentMessage',
                    },
                },
                { $unwind: { path: '$recentMessage', preserveNullAndEmptyArrays: true } },
                { $addFields: { sort: { $ifNull: ['$recentMessage.createdAt', '$createdAt'] } } },
                { $sort: { sort: -1 } },
                { $skip: (page - 1) * perPage },
                { $limit: perPage },
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
                        from: 'colleges',
                        localField: 'college',
                        foreignField: '_id',
                        as: 'college',
                    },
                },
                { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
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
                        from: 'employers',
                        localField: 'employer',
                        foreignField: '_id',
                        as: 'employer',
                    },
                },
                { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'employer-admins',
                        let: { employerAdminId: '$employerAdmins' },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $in: ['$_id', '$$employerAdminId'] }] } } },
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
                        as: 'employerAdmins',
                    },
                },
                {
                    $lookup: {
                        from: 'employer-admins',
                        let: { employerAdminId: '$createdBy' },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ['$_id', '$$employerAdminId'] }] } } },
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
                        as: 'createdBy',
                    },
                },
                { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
                { $sort: { sort: -1 } },
                { $unset: 'sort' },
            ]),
            this.chatModel
                .aggregate([
                { $match: find },
                {
                    $addFields: {
                        isCreator: { $cond: { if: { $eq: ['$createdBy', _id] }, then: true, else: false } },
                    },
                },
                {
                    $match: {
                        $or: [{ isCreator: false }, { $and: [{ isCreator: true, showToCreator: { $in: [true, null] } }] }],
                    },
                },
                {
                    $lookup: {
                        from: 'source-talents',
                        localField: 'moduleDocumentId',
                        foreignField: '_id',
                        as: 'sourceTalent',
                    },
                },
                { $unwind: { path: '$sourceTalent', preserveNullAndEmptyArrays: true } },
                {
                    $match: {
                        'sourceTalent.type': sourceTalentType,
                        'sourceTalent._id': { $in: sourceTalents.map(id => mongoose.Types.ObjectId(id)) },
                    },
                },
                {
                    $group: {
                        _id: null,
                        rows: { $sum: 1 },
                    },
                },
            ])
                .exec(),
        ]);
        return ResponseHandler_1.default.success({ chats, rows: rows && rows.length > 0 ? rows[0].rows : 0 });
    }
    async updateShowToCreator(id, value) {
        const chat = await this.chatModel.findByIdAndUpdate(id, { $set: { showToCreator: value } }).exec();
        return ResponseHandler_1.default.success(chat, 'Chat updated successfully.');
    }
    async getChatById(id, lean, populate) {
        let chat = this.chatModel.findById(id);
        if (populate) {
            chat = chat
                .populate('learner')
                .populate('employerAdmins')
                .populate('users')
                .populate('course')
                .populate('college');
        }
        if (lean) {
            chat = await chat.lean();
        }
        else {
            chat = await chat.exec();
        }
        return ResponseHandler_1.default.success(chat);
    }
    async getMembersForChat(params, user) {
        const { type, collegeId, employerId, _id } = user;
        const { perPage, keyword } = params;
        let members = [];
        if (type === 'user' && collegeId) {
            members = await this.userModel
                .find({ collegeId: { $in: [collegeId, null] }, _id: { $ne: _id } }, 'fullname profilePhoto profilePhotoThumbnail designation collegeId')
                .populate('collegeId', 'title')
                .byName(keyword)
                .sort({ fullname: 1 })
                .collation({ locale: 'en' })
                .limit(perPage)
                .lean()
                .exec();
        }
        else if (type === 'employer') {
            const users = await this.userModel
                .find({ collegeId: null }, 'fullname profilePhoto profilePhotoThumbnail designation')
                .byName(keyword)
                .sort({ fullname: 1 })
                .collation({ locale: 'en' })
                .limit(perPage)
                .lean()
                .exec();
            const employers = await this.employerAdminModel
                .find({ employerId, _id: { $ne: _id } }, 'fullname profilePhoto profilePhotoThumbnail designation employerId')
                .populate('employerId', 'title')
                .byName(keyword)
                .sort({ fullname: 1 })
                .collation({ locale: 'en' })
                .limit(perPage)
                .lean()
                .exec();
            members = members
                .concat(users, employers)
                .sort((a, b) => a.fullname.localeCompare(b.fullname))
                .slice(0, perPage - 1);
        }
        else if (params.type === chat_model_1.ChatType.EMPLOYER) {
            const users = await this.userModel
                .find({ collegeId: null, _id: { $ne: _id } }, 'fullname profilePhoto profilePhotoThumbnail designation')
                .byName(keyword)
                .sort({ fullname: 1 })
                .collation({ locale: 'en' })
                .limit(perPage)
                .lean()
                .exec();
            const employers = await this.employerAdminModel
                .find({}, 'fullname profilePhoto profilePhotoThumbnail designation employerId')
                .populate('employerId', 'title')
                .byName(keyword)
                .sort({ fullname: 1 })
                .collation({ locale: 'en' })
                .limit(perPage)
                .lean()
                .exec();
            members = members
                .concat(users, employers)
                .sort((a, b) => a.fullname.localeCompare(b.fullname))
                .slice(0, perPage - 1);
        }
        else if (type === 'user' && !collegeId && params.type === chat_model_1.ChatType.COLLEGE) {
            members = await this.userModel
                .find({ _id: { $ne: _id } }, 'fullname profilePhoto profilePhotoThumbnail designation collegeId')
                .populate('collegeId', 'title')
                .byName(keyword)
                .sort({ fullname: 1 })
                .collation({ locale: 'en' })
                .limit(perPage)
                .lean()
                .exec();
        }
        return ResponseHandler_1.default.success(members);
    }
    async addChatToArchive(params, user) {
        const { chatId, archive } = params;
        const update = archive ? { $push: { archivedChats: chatId } } : { $pull: { archivedChats: chatId } };
        if (user.type === 'employer') {
            await this.employerAdminModel.findByIdAndUpdate(user._id, update, { new: true });
        }
        else if (user.type === 'user') {
            await this.userModel.findByIdAndUpdate(user._id, update, { new: true });
        }
        return ResponseHandler_1.default.success({}, 'Chat archived successfully.');
    }
};
ChatService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('chats')),
    __param(1, mongoose_1.InjectModel('messages')),
    __param(2, mongoose_1.InjectModel('users')),
    __param(3, mongoose_1.InjectModel('employer-admins')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, notifications_service_1.NotificationsService])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map