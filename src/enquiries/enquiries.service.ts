import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NewEnquiryDto } from './dto/newEnquiry.dto';
import { GetEnquiriesDto } from './dto/getEnquiries.dto';
import ResponseHandler from '../common/ResponseHandler';
import * as mongoose from 'mongoose';
// import * as Pusher from 'pusher';
import { pusher } from '../config/config';
import { AddUserEnquiryDto } from './dto/addUserEnquiry.dto';
import { AddEnquiryMembersDto } from '../enquiries/dto/addMembers.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailerService } from '@nest-modules/mailer';
import emailHtml from '../common/emailHtml';
import moment = require('moment');
import { EmailLogsService } from '../email-logs/email-logs.service';
import { Portal } from '../email-logs/email-logs.model';

// const pusher = new Pusher({
//   appId: '979063',
//   key: 'c951599fc08ee055d95c',
//   secret: '2bc8d3eb447aecc6459c',
//   cluster: 'us3',
//   encrypted: true,
// });

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectModel('enquiries') private readonly enquiryModel,
    @InjectModel('enquiry-messages') private readonly enquiryMessagesModel,
    @InjectModel('courses') private readonly courseModel,
    @InjectModel('learners') private readonly learnerModel,
    @InjectModel('chats') private readonly chatModel,
    @InjectModel('messages') private readonly messageModel,
    private readonly notificationsService: NotificationsService,
    private readonly mailerService: MailerService,
    private readonly emailLogsService: EmailLogsService,
  ) {}

  async getUserEnquiries(user) {
    const match =
      user.role !== 'superadmin' && user.role !== 'admin'
        ? { users: mongoose.Types.ObjectId(user._id), module: 'enquiries' }
        : { 'course.collegeId': mongoose.Types.ObjectId(user.collegeId), module: 'enquiries' };
    const enquiries = await this.chatModel.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $match: match },
      {
        $lookup: {
          from: 'learners',
          localField: 'learner',
          foreignField: '_id',
          as: 'learner',
        },
      },
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$chat', '$$chatId'] }] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                message: 1,
                hasUnreadMessages: {
                  $cond: [
                    { $gt: [{ $size: { $setIntersection: ['$readByUsers', [mongoose.Types.ObjectId(user._id)]] } }, 0] },
                    false,
                    true,
                  ],
                },
                createdAt: 1,
              },
            },
          ],
          as: 'recentMessage',
        },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$recentMessage', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          'course._id': 1,
          'course.title': 1,
          'learner.fullname': 1,
          'learner.profilePhoto': 1,
          'learner.profilePhotoThumbnail': 1,
          hasUnreadMessages: '$recentMessage.hasUnreadMessages',
          recentMessage: 1,
          createdAt: 1,
        },
      },
      { $sort: { 'recentMessage.createdAt': -1, createdAt: -1 } },
    ]);

    return ResponseHandler.success(enquiries);
  }

  async getLearnerEnquiries(learner) {
    const enquiries = await this.chatModel.aggregate([
      {
        $match: { learner: mongoose.Types.ObjectId(learner._id), module: 'enquiries' },
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $lookup: {
          from: 'colleges',
          localField: 'course.collegeId',
          foreignField: '_id',
          as: 'college',
        },
      },
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ['$chat', '$$chatId'] }] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: 'learners',
                localField: 'learner',
                foreignField: '_id',
                as: 'learner',
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
            { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                message: 1,
                readByLearner: 1,
                'user.fullname': 1,
                'user.profilePhoto': 1,
                'user.profilePhotoThumbnail': 1,
                'learner.fullname': 1,
                'learner.profilePhoto': 1,
                'learner.profilePhotoThumbnail': 1,
              },
            },
          ],
          as: 'recentMessage',
        },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$college', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$recentMessage', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          'course._id': 1,
          'course.title': 1,
          recentMessage: 1,
          'college.title': 1,
          'college.collegeLogo': 1,
          createdAt: 1,
        },
      },
    ]);

    return ResponseHandler.success(enquiries);
  }

  async addLearnerEnquiryMessage(enquiryData: { course: string; learner?: string; message: string }) {
    const { learner, course, message } = enquiryData;

    const [enquiry, courseData, learnerData] = await Promise.all([
      this.chatModel
        .findOne({
          learner: mongoose.Types.ObjectId(learner),
          course: mongoose.Types.ObjectId(course),
          module: 'enquiries',
        })
        .lean()
        .exec(),
      this.courseModel
        .findById(course, 'title collegeId')
        .populate('collegeId', 'title')
        .lean()
        .exec(),
      this.learnerModel
        .findById(learner, 'fullname emailAddress phoneNumber')
        .lean()
        .exec(),
    ]);

    if (enquiry) {
      const enquiryMessage = await this.messageModel.create({
        chat: enquiry._id,
        message,
        learner,
      });
      await enquiryMessage
        .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
        .populate({ path: 'chat', populate: { path: 'course', select: 'title collegeId' } })
        .execPopulate();

      this.notificationsService.newEnquiry(enquiryMessage);

      pusher.trigger(`enquiry-message-${enquiry._id}`, 'new-message', enquiryMessage);
      return ResponseHandler.success({ enquiry, message: enquiryMessage });
    } else {
      const newEnquiry = await this.chatModel.create({
        learner,
        course,
        college: courseData.collegeId,
        createdBy: learner,
        createdByType: 'learner',
        module: 'enquiries',
      });
      await newEnquiry
        .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
        .populate('course', 'title coverPhoto coverPhotoThumbnail')
        .execPopulate();

      const collegeAdmins = await this.courseModel
        .aggregate([
          { $match: { _id: mongoose.Types.ObjectId(course) } },
          {
            $lookup: {
              from: 'users',
              let: { collegeId: '$collegeId' },
              pipeline: [
                { $match: { $expr: { $and: [{ $eq: ['$collegeId', '$$collegeId'] }, { $in: ['$role', ['superadmin', 'admin']] }] } } },
                { $project: { _id: 1, role: 1, emailAddress: 1, notifications: 1 } },
              ],
              as: 'admins',
            },
          },
          { $project: { admins: 1 } },
        ])
        .exec();

      let superadmin = null;
      const superadminArray = [];
      collegeAdmins[0].admins.forEach(admin => {
        pusher.trigger(`new-enquiry-group-${admin._id}`, 'new-enquiry-group', newEnquiry);
        if (admin.role !== 'admin' && admin.notifications && admin.notifications.email) {
          superadmin = admin._id;
          superadminArray.push(admin);
        }
      });

      const enquiryMessage = await this.messageModel.create({
        chat: newEnquiry._id,
        message,
        learner,
      });
      const replyMessage = await this.messageModel.create({
        chat: newEnquiry._id,
        message: `Thank you for contacting us. We will get back to you within 1 day.`,
        user: superadmin,
      });
      await Promise.all([
        enquiryMessage.populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
        .populate({ path: 'chat', populate: { path: 'course', select: 'title collegeId' } }).execPopulate(),
        replyMessage.populate('user', 'fullname profilePhoto profilePhotoThumbnail').execPopulate(),
      ]);
      this.notificationsService.newEnquiry(enquiryMessage);
// moment(new Date()).format('LL')
      const mailData = {
        to: process.env.SUPPORT_MAIL,
        from: process.env.ADMIN_NOTIFICATION_FROM,
        subject: 'An Unmudl learner is requesting help',
        template: 'supportEnquiry',
        context: {
          unmudlLogo: process.env.UNMUDL_LOGO_PATH,
          date: moment(new Date()).format('LL'),
          learner: learnerData,
          contact: learnerData.emailAddress ? learnerData.emailAddress : learnerData.phoneNumber,
          college: courseData.collegeId,
          course: courseData,
          message: enquiryMessage.message,
        },
      };
      const mail = await this.mailerService.sendMail(mailData);

      mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;
      for (let i = 0; i < superadminArray.length; i++) {
        setTimeout(async () => {
          const mailData = {
            to: superadminArray[i].emailAddress,
            from: process.env.ADMIN_NOTIFICATION_FROM,
            replyTo: learnerData.emailAddress,
            subject: 'UNMUDL Notification',
            template: 'adminLearnerEnquiry',
            context: {
              unmudlLogo: process.env.UNMUDL_LOGO_PATH,
              date: moment(new Date()).format('LL'),
              learner: learnerData,
              course: courseData,
              message: enquiryMessage.message,
            },
          };
          const mail = await this.mailerService.sendMail(mailData);

          mail ? this.emailLogsService.createEmailLog(mailData, Portal.LEARNER) : null;
        }, 1000);
      }
      // const courseData = await this.course
      return ResponseHandler.success({ enquiry: newEnquiry, message: enquiryMessage, reply: replyMessage });
    }
  }

  async getEnquiryMessages(params) {
    const { enquiry, page, perPage, userId, learnerId, isAdmin } = params;
    const find = learnerId
      ? { _id: mongoose.Types.ObjectId(enquiry), learner: mongoose.Types.ObjectId(learnerId) }
      : isAdmin
      ? { _id: mongoose.Types.ObjectId(enquiry) }
      : { _id: mongoose.Types.ObjectId(enquiry), users: mongoose.Types.ObjectId(userId) };

    const enquiryExist = await this.chatModel
      .findOne(find)
      .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
      .populate('users', 'fullname profilePhoto profilePhotoThumbnail')
      .lean()
      .exec();
    if (!enquiryExist) {
      return ResponseHandler.fail('You are not part of this enquiry.');
    }

    const messages = await this.messageModel
      .find({ chat: mongoose.Types.ObjectId(enquiry) })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
      .populate('user', 'fullname profilePhoto profilePhotoThumbnail')
      .lean()
      .exec();

    const messageIds = messages.map(message => message._id);
    if (learnerId) {
      await this.messageModel.updateMany({ _id: { $in: messageIds } }, { readByLearner: true }, { multi: true, upsert: false });
    } else {
      await this.messageModel.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { readByUsers: userId } },
        { multi: true, upsert: false },
      );
    }

    return ResponseHandler.success({ messages, chatGroup: enquiryExist });
  }

  async createEnquiry(newEnquiryDto: NewEnquiryDto) {
    try {
      const enquiry = new this.enquiryModel(newEnquiryDto);
      const result = await enquiry.save();
      pusher.trigger(`user-${newEnquiryDto.learner}-course-${newEnquiryDto.course}`, 'new-enquiry', enquiry);
      return ResponseHandler.success(result, 'Message sent successfully.');
    } catch (error) {
      return ResponseHandler.fail(error);
    }
  }

  async getEnquiries(getEnquiriesDto: GetEnquiriesDto) {
    try {
      const offset = getEnquiriesDto.offset ? getEnquiriesDto.offset : 0;
      const enquiries = await this.enquiryModel
        .aggregate([
          {
            $match: {
              learner: mongoose.Types.ObjectId(getEnquiriesDto.learner),
              course: mongoose.Types.ObjectId(getEnquiriesDto.course),
            },
          },
          { $sort: { createdAt: -1 } },
          { $skip: offset },
          { $limit: 5 },
          {
            $lookup: {
              from: 'courses',
              localField: 'course',
              foreignField: '_id',
              as: 'courseDetail',
            },
          },
          { $unwind: '$courseDetail' },
          {
            $lookup: {
              from: 'colleges',
              localField: 'courseDetail.collegeId',
              foreignField: '_id',
              as: 'collegeDetail',
            },
          },
          { $unwind: '$collegeDetail' },
          {
            $lookup: {
              from: 'users',
              localField: 'collegeRep',
              foreignField: '_id',
              as: 'collegeRepDetail',
            },
          },
          {
            $unwind: {
              path: '$collegeRepDetail',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              courseTitle: '$courseDetail.title',
              collegeTitle: '$collegeDetail.title',
              collegeRepName: '$collegeRepDetail.fullname',
              collegeRepPhoto: '$collegeRepDetail.profilePhoto',
            },
          },
          { $unset: ['courseDetail', 'collegeDetail', 'collegeRepDetail'] },
        ])
        .exec();
      const totalEnquiries = await this.enquiryModel
        .find({
          learner: getEnquiriesDto.learner,
          course: getEnquiriesDto.course,
        })
        .countDocuments();
      return ResponseHandler.success({
        messages: enquiries,
        totalEnquiries,
      });
    } catch (error) {
      return ResponseHandler.fail(error);
    }
  }

  async addUserEnquiry(userEnquiry: AddUserEnquiryDto, user) {
    const { enquiryGroupId, message } = userEnquiry;

    const enquiry = await this.chatModel
      .findById(enquiryGroupId)
      .populate('course')
      .exec();

    if (!enquiry) {
      return ResponseHandler.fail('Invalid enquiry Id.');
    }

    if (
      enquiry.course.collegeId.toString() !== user.collegeId.toString() ||
      (user.role !== 'superadmin' && user.role !== 'admin' && !enquiry.users.includes(user._id.toString()))
    ) {
      return ResponseHandler.fail('You are not part of this enquiry.');
    }

    if (!enquiry.users.includes(user._id.toString())) {
      enquiry.users.push(user._id);
      enquiry.save();
    }

    const enquiryMessage = await this.messageModel.create({
      chat: enquiry._id,
      message,
      readByLearner: false,
      readByUsers: [user._id],
      user: user._id,
    });
    await enquiryMessage
      .populate('user', 'fullname profilePhoto profilePhotoThumbnail')
      .populate({ path: 'chat', populate: { path: 'course', select: 'title' } })
      .execPopulate();

    this.notificationsService.newEnquiry(enquiryMessage);

    pusher.trigger(`enquiry-message-${enquiry._id}`, 'new-message', enquiryMessage);

    return ResponseHandler.success({ message: enquiryMessage });
  }

  async addMembers(addMembers: AddEnquiryMembersDto, user) {
    const { enquiryGroupId, users } = addMembers;

    const enquiry = await this.chatModel
      .findById(enquiryGroupId)
      .populate('course')
      .lean()
      .exec();

    if (!enquiry || enquiry.course.collegeId.toString() !== user.collegeId.toString()) {
      return ResponseHandler.fail('Invalid enquiry Id.');
    }

    const updatedEnquiry = await this.chatModel.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(enquiryGroupId) },
      { $addToSet: { users: { $each: users } } },
      { new: true, upsert: false },
    );
    await updatedEnquiry
      .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
      .populate('course', 'title coverPhoto coverPhotoThumbnail')
      .execPopulate();

    users.forEach(userId => {
      pusher.trigger(`new-enquiry-group-${userId}`, 'added-in-enquiry-group', updatedEnquiry);
    });

    return ResponseHandler.success({}, 'Members added successfully.');
  }

  async getLearnersEnquiry(learnerId, courseId) {
    return await this.enquiryModel
      .findOne(
        {
          learner: mongoose.Types.ObjectId(learnerId),
          course: mongoose.Types.ObjectId(courseId),
        },
        '_id',
      )
      .lean()
      .exec();
  }

  async updateReadBy(updateMessage) {
    const { messageId, userId, learnerId } = updateMessage;

    const update = userId
      ? await this.messageModel.findByIdAndUpdate(messageId, { $push: { readByUsers: userId } }, { new: true })
      : await this.messageModel.findByIdAndUpdate(messageId, { readByLearner: true }, { new: true });

    return ResponseHandler.success({}, 'readBy updated succesfully.');
  }

  async getChatGroupDetail(params) {
    const { chatId, user, learnerId } = params;

    const find = learnerId
      ? { _id: mongoose.Types.ObjectId(chatId), learner: mongoose.Types.ObjectId(learnerId) }
      : user.role !== 'superadmin' && user.role !== 'admin'
      ? { _id: mongoose.Types.ObjectId(chatId), users: mongoose.Types.ObjectId(user._id) }
      : { _id: mongoose.Types.ObjectId(chatId) };

    const chatGroup = await this.chatModel
      .findOne(find)
      .populate('users', 'fullname profilePhoto profilePhotoThumbnail role')
      .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
      .populate('course', 'collegeId')
      .lean()
      .exec();

    if (!chatGroup || chatGroup.course.collegeId.toString() !== user.collegeId.toString()) {
      return ResponseHandler.fail('You are not part of this chat.');
    }

    return ResponseHandler.success(chatGroup);
  }
}
