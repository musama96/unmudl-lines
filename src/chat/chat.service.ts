import { Injectable } from '@nestjs/common';
import { AddChatDto } from './dto/addChat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AddChatReplyDto } from './dto/addReply.dto';
import { ChatListDto, ChatModuleEnum } from './dto/chatList.dto';
import { AddMembersDto } from './dto/addMembers.dto';
import { pusher } from '../config/config';
import { NotificationsService } from '../notifications/notifications.service';
import { GetMembersDto } from './dto/getMembers.dto';
import * as mongoose from 'mongoose';

import ResponseHandler from '../common/ResponseHandler';
import { ChatType } from './chat.model';
import { SourceTalentChatListDto } from './dto/sourceTalentChatList.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('chats') private readonly chatModel,
    @InjectModel('messages') private readonly messageModel,
    @InjectModel('users') private readonly userModel,
    @InjectModel('employer-admins') private readonly employerAdminModel,
    private readonly notificationsService: NotificationsService,
  ) {}

  async addChat(chat: AddChatDto) {
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
      // { $addFields: { createdBy: { $toObjectId: '$createdBy' } } },
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
      // @ts-ignore
      chat._id = newChat._id;
      (() => this.notificationsService.newGenericChat(chat))();

      if (newChat.module !== 'source-talent') {
        chat.employerAdmins.forEach(member => {
          pusher.trigger(`new-chat-${member}`, 'new-chat', newChat);
        });
        chat.users.forEach(member => {
          pusher.trigger(`new-chat-${member}`, 'new-chat', newChat);
        });
        if (chat.learner) {
          pusher.trigger(`new-chat-${chat.learner}`, 'new-chat', newChat);
        }
      }
    }

    return ResponseHandler.success(newChat, 'Chat created successfully.');
  }

  async getChatDetails(id, user) {
    const { _id: userId, type } = user;
    // updating chat to add user's id to read by array
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

    const find: { learner?: string; $or?: any; _id?: any; module?: any; deletedAt: null; groupName?: any } = {
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

    return ResponseHandler.success({ chat, messages, unreadChats: unreadChats && unreadChats.length > 0 ? unreadChats[0].unreadChats : 0 });
  }

  async deleteChat(chatId, userId) {
    const chat = await this.chatModel.deleteOne({ _id: mongoose.Types.ObjectId(chatId), createdBy: userId }).exec();
    if (chat.deletedCount > 0) {
      await this.messageModel.deleteMany({ chat: mongoose.Types.ObjectId(chatId) }).exec();
      return ResponseHandler.success({}, 'Chat deleted successfully.');
    } else {
      return ResponseHandler.fail('Can only delete your own chat.');
    }
  }

  async softDeleteChat(chatId) {
    await this.chatModel.findByIdAndUpdate(chatId, { $set: { deletedAt: new Date() } }, { new: true }).exec();
    return ResponseHandler.success(null, 'Chat deleted successfully.');
  }

  async updateChatModuleDocumentId(chatId, documentId) {
    const chat = await this.chatModel.findByIdAndUpdate(chatId, { $set: { moduleDocumentId: documentId } }, { new: true }).exec();

    return ResponseHandler.success(chat, 'Chat updated successfully');
  }

  async addChatReply(reply: AddChatReplyDto) {
    let newMessage = new this.messageModel(reply);
    newMessage = await newMessage.save();

    newMessage = await newMessage
      .populate({ path: 'employerAdmin', populate: 'employerId' })
      .populate('learner')
      .populate({ path: 'user', populate: 'collegeId' })
      .execPopulate();

    const testMessage = newMessage.toObject();
    testMessage.createdAt = testMessage.createdAt.toISOString();
    pusher.trigger(`chat-${reply.chat}`, 'new-message', testMessage);

    await this.chatModel
      .findByIdAndUpdate(
        reply.chat,
        {
          $set: {
            readByLearner: !!reply.learner,
            readByEmployerAdmins: reply.employerAdmin ? [reply.employerAdmin] : [],
            readByUsers: reply.user ? [reply.user] : [],
          },
        },
        { new: true },
      )
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

    if (
      (chat.module !== 'employer-proposal-response' || (chat.module === 'employer-proposal-response' && messagesCount > 1)) &&
      (chat.module !== 'source-talent' || (chat.module === 'source-talent' && messagesCount > 1))
    ) {
      (() => this.notificationsService.newChatMessage(chat, newMessage))();
    }

    return ResponseHandler.success(newMessage);
  }

  async addMembersToChat({ chatId, users, learner, employerAdmins, replaceExistingEmployerAdmins, replaceExistingUsers }: AddMembersDto) {
    const update: { $addToSet?: { employerAdmins?: any; users?: any }; learner?: any; employerAdmins?: any; users?: any } = {};

    if (employerAdmins && employerAdmins.length > 0) {
      if (replaceExistingEmployerAdmins) {
        update.employerAdmins = employerAdmins;
      } else {
        if (!update.$addToSet) {
          update.$addToSet = {};
        }
        update.$addToSet.employerAdmins = replaceExistingEmployerAdmins ? employerAdmins : { $each: employerAdmins };
      }
    }
    if (users && users.length > 0) {
      if (replaceExistingUsers) {
        update.users = users;
      } else {
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
    } else {
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
        pusher.trigger(`new-chat-${member}`, 'new-chat', chat);
      });
    }
    if (users && users.length > 0) {
      users.forEach(member => {
        pusher.trigger(`new-chat-${member}`, 'new-chat', chat);
      });
    }
    if (learner) {
      pusher.trigger(`new-chat-${learner}`, 'new-chat', chat);
    }

    return ResponseHandler.success(chat, 'Members added to the chat successfully.');
  }

  async initializeContactUnmudlChats(user) {
    const unmudlAdmins = await this.userModel
      .find({
        invitation: 'accepted',
        isSuspended: { $ne: true },
        collegeId: null,
      })
      .lean();

    const newChats = await Promise.all(
      unmudlAdmins.map(async admin => {
        const chat: AddChatDto = {
          createdBy: admin._id,
          createdByType: 'user',
          type: ChatType.EMPLOYER,
          employerAdmins: [user._id],
          employer: user.employerId,
          showToCreator: false,
          module: ChatModuleEnum.INTERNAL_CHAT,
          users: [admin._id],
        };

        const { data: newChat } = await this.addChat(chat);

        return newChat;
      }),
    );

    return ResponseHandler.success(newChats);
  }

  async getChatsForAUser(params: ChatListDto, user) {
    const { type, _id, collegeId, employerId, archivedChats, role } = user;
    const { perPage, page, sortBy, sortOrder, archive, module, moduleDocumentIds, keyword } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const find: { learner?: string; $or?: any; _id?: any; module?: any; moduleDocumentId?: any; deletedAt: null; groupName?: any } = {
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
        // uncomment if you want to show all chats of an employer to all its admins and comment the line below
        // find.$or = myChatsOnly ? [{ employerAdmins: _id }] : [{ employerAdmins: _id }, { employer: employerId }];
        find.$or = role !== 'system' ? [{ employerAdmins: _id }] : [{ employer: employerId }];

        unreadChatsMatch = {
          readByEmployerAdmins: {
            $nin: [_id],
          },
        };
        break;
      case 'user':
        // uncomment if you want to show all chats of a college to all its admins and comment the line below
        // find.$or = myChatsOnly ? [{ users: _id }] : [{ users: _id }, { college: collegeId }];
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
          // { $addFields: { createdBy: { $toObjectId: '$createdBy' } } },
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

    return ResponseHandler.success({
      chats,
      rows: rows && rows.length > 0 ? rows[0].rows : 0,
      unreadChats: unreadChats && unreadChats.length > 0 ? unreadChats[0].unreadChats : 0,
    });
  }

  async getSourceTalentChatsForAUser(params: SourceTalentChatListDto, user) {
    const { type, _id, collegeId, employerId, archivedChats } = user;
    const { perPage, page, sortBy, sortOrder, archive, myChatsOnly, keyword, type: sourceTalentType, sourceTalents } = params;

    const sort = {};
    sort[sortBy] = Number(sortOrder);

    const find: { learner?: string; $or?: any; _id?: any; module?: any; deletedAt: null; groupName?: any } = {
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

    return ResponseHandler.success({ chats, rows: rows && rows.length > 0 ? rows[0].rows : 0 });
  }

  async updateShowToCreator(id, value) {
    const chat = await this.chatModel.findByIdAndUpdate(id, { $set: { showToCreator: value } }).exec();

    return ResponseHandler.success(chat, 'Chat updated successfully.');
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
    } else {
      chat = await chat.exec();
    }

    return ResponseHandler.success(chat);
  }

  async getMembersForChat(params: GetMembersDto, user) {
    const { type, collegeId, employerId, _id } = user;
    const { perPage, keyword } = params;
    let members = [];

    if (type === 'user' && collegeId) {
      members = await this.userModel
        .find(
          { collegeId: { $in: [collegeId, null] }, _id: { $ne: _id } },
          'fullname profilePhoto profilePhotoThumbnail designation collegeId',
        )
        .populate('collegeId', 'title')
        .byName(keyword)
        .sort({ fullname: 1 })
        .collation({ locale: 'en' })
        .limit(perPage)
        .lean()
        .exec();
    } else if (type === 'employer') {
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
    } else if (params.type === ChatType.EMPLOYER) {
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
    } else if (type === 'user' && !collegeId && params.type === ChatType.COLLEGE) {
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

    return ResponseHandler.success(members);
  }

  async addChatToArchive(params, user) {
    const { chatId, archive } = params;

    const update = archive ? { $push: { archivedChats: chatId } } : { $pull: { archivedChats: chatId } };

    if (user.type === 'employer') {
      await this.employerAdminModel.findByIdAndUpdate(user._id, update, { new: true });
    } else if (user.type === 'user') {
      await this.userModel.findByIdAndUpdate(user._id, update, { new: true });
    }

    return ResponseHandler.success({}, 'Chat archived successfully.');
  }
}
