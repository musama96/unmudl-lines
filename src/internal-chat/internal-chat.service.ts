import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatGroup } from './chat-group.model';
import ResponseHandler from '../common/ResponseHandler';
import { Message } from './chat-message.model';
import { pusher } from '../config/config';
import * as mongoose from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InternalChatService {
  constructor(
    @InjectModel('chat-groups') private readonly chatGroupModel,
    @InjectModel('chat-messages') private readonly chatMessagesModel,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getChatGroups(userId: string) {
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
    // .find({members: mongoose.Types.ObjectId(userId)})
    // .populate('members', 'fullname profilePhoto profilePhotoThumbnail role')
    // .populate('createdBy', 'fullname role profilePhoto profilePhotoThumbnail')
    // .lean().exec();

    return ResponseHandler.success(groups);
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
      return ResponseHandler.fail('You are not part of this chat.');
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
    await this.chatMessagesModel.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { readBy: userId } },
      { multi: true, upsert: false },
    );

    return ResponseHandler.success({ messages, userId });
  }

  async createChatGroup(chatGroupData: ChatGroup) {
    let chatGroup = await this.chatGroupModel.create(chatGroupData);
    chatGroup = await chatGroup
      .populate('members', 'fullname profilePhoto profilePhotoThumbnail role')
      .populate('createdBy', 'fullname profilePhoto profilePhotoThumbnail role')
      .execPopulate();

    this.notificationsService.newChat(chatGroup, chatGroupData.members);

    chatGroup.members.forEach(member => {
      pusher.trigger(`new-chat-group-${member._id}`, 'new-chat-group', chatGroup);
    });

    return ResponseHandler.success(chatGroup);
  }

  async sendMessage(messageData: Message) {
    messageData.readBy = [messageData.from];

    let message = await this.chatMessagesModel.create(messageData);
    message = await message
      .populate('from', 'fullname profilePhoto profilePhotoThumbnail')
      .populate('chatId')
      .execPopulate();

    this.notificationsService.newMessage(message);

    pusher.trigger(`internal-chat-${messageData.chatId}`, 'new-message', message);
    return ResponseHandler.success(message);
  }

  async addMembers(addMembersData: { chatId: string; members: string[] }) {
    const { members, chatId } = addMembersData;

    let chatGroup = await this.chatGroupModel.findByIdAndUpdate(chatId, { $addToSet: { members: { $each: members } } }, { new: true });
    chatGroup = await chatGroup
      .populate('members', 'fullname profilePhoto profilePhotoThumbnail role')
      .populate('createdBy', 'fullname profilePhoto profilePhotoThumbnail role')
      .execPopulate();

    this.notificationsService.newChat(chatGroup, members);

    members.forEach(member => {
      pusher.trigger(`new-chat-group-${member}`, 'new-chat-group', chatGroup);
    });
    return ResponseHandler.success(chatGroup, 'Members added successfully.');
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
      return ResponseHandler.fail('You are not part of this chat.');
    }

    return ResponseHandler.success(chatGroup);
  }

  async updateReadBy(updateMessage) {
    const { messageId, userId } = updateMessage;

    const update = await this.chatMessagesModel.findByIdAndUpdate(messageId, { $push: { readBy: userId } }, { new: true });
    return ResponseHandler.success({}, 'readBy updated succesfully.');
  }
}
