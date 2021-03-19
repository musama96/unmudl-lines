/* tslint:disable:no-string-literal */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import ResponseHandler from '../common/ResponseHandler';
import { ContactCollegesProposalResponsesListDto } from './dto/contact-colleges-proposals-list.dto';
import { CreateProposalResponseDto } from './dto/create-proposal-response.dto';
import * as mongoose from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ContactCollegeResponsesService {
  constructor(
    @InjectModel('contact-college-responses') private readonly contactCollegeResponseModel,
    @InjectModel('messages') private readonly messageModel,
    @InjectModel('employer-admins') private readonly employerAdminModel,
    @InjectModel('users') private readonly userModel,
    @InjectModel('learners') private readonly learnerModel,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getProposalResponses(params: ContactCollegesProposalResponsesListDto) {
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
      } else {
        proposalMatch['proposal.employer'] = mongoose.Types.ObjectId(employerId);
      }
    }

    const match = {
      proposal: proposals?.length > 0 ? { $in: proposals.map(proposal => mongoose.Types.ObjectId(proposal)) } : { $ne: null },
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

    pipeline.push(
      ...[
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
      ],
    );

    const unreadMessagesCountPipeline = [...pipeline];

    pipeline.push(
      ...[
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
      ],
    );

    const responses = await this.contactCollegeResponseModel
      .aggregate(pipeline)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    rowsPipeline.push(
      ...[
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
      ],
    );

    rowsPipeline.push({
      $group: {
        _id: null,
        rows: { $sum: 1 },
      },
    });

    const rows = await this.contactCollegeResponseModel.aggregate(rowsPipeline).exec();

    unreadMessagesCountPipeline.push(
      ...[
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
      ],
    );

    const unreadMessagesCount = await this.contactCollegeResponseModel.aggregate(unreadMessagesCountPipeline).exec();

    return ResponseHandler.success({
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

    return ResponseHandler.success(response);
  }

  async createProposalResponse(response: CreateProposalResponseDto, employer) {
    const oldProposalResponse = await this.contactCollegeResponseModel
      .findOne({ proposal: response.proposal, college: response.college })
      .lean();

    if (oldProposalResponse) {
      return ResponseHandler.fail(
        'Could not submit the proposal response. A response to this proposal has already been submitted by your college.',
      );
    }

    let newResponse = await this.contactCollegeResponseModel.create(response);
    newResponse = await newResponse
      .populate('proposedBy', '_id employerId')
      .populate('proposal', 'title')
      .execPopulate();
    this.notificationsService.newProposalResponse(newResponse);

    return ResponseHandler.success(newResponse, 'Response to the proposal request submitted successfully.');
  }
}
