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
const chat_service_1 = require("../chat/chat.service");
const chatList_dto_1 = require("../chat/dto/chatList.dto");
const ResponseHandler_1 = require("../common/ResponseHandler");
const createSourceTalent_dto_1 = require("./dto/createSourceTalent.dto");
const config_1 = require("../config/config");
const mongoose = require("mongoose");
const moment = require("moment");
const mailer_1 = require("@nest-modules/mailer");
const users_service_1 = require("../users/users.service");
let SourceTalentService = class SourceTalentService {
    constructor(sourceTalentModel, courseModel, enrollmentModel, userModel, chatModel, employerModel, chatService, mailerService, usersService) {
        this.sourceTalentModel = sourceTalentModel;
        this.courseModel = courseModel;
        this.enrollmentModel = enrollmentModel;
        this.userModel = userModel;
        this.chatModel = chatModel;
        this.employerModel = employerModel;
        this.chatService = chatService;
        this.mailerService = mailerService;
        this.usersService = usersService;
    }
    async getSourceTalentsList(params) {
        const { keyword, page, perPage, sortBy, sortOrder, employerId, type } = params;
        const sort = {};
        sort[sortBy] = Number(sortOrder);
        const find = { title: { $regex: keyword, $options: 'i' }, deletedAt: null };
        if (employerId) {
            find.employer = employerId;
        }
        if (type) {
            find.type = type;
        }
        const [employers, rows] = await Promise.all([
            this.sourceTalentModel
                .find(find)
                .sort(sort)
                .skip((page - 1) * perPage)
                .limit(perPage)
                .populate({
                path: 'course',
                select: {
                    title: 1,
                    coverPhoto: 1,
                    coverPhotoThumbnail: 1,
                    date: 1,
                },
                populate: [
                    {
                        path: 'collegeId',
                        select: 'title',
                    },
                    {
                        path: 'instructorIds',
                        select: 'fullname',
                    },
                ],
            })
                .populate('employer', 'title')
                .exec(),
            this.sourceTalentModel.countDocuments(find).exec(),
        ]);
        return ResponseHandler_1.default.success({ employers, rows });
    }
    async getLearnerSourceTalentRequests(learner) {
        const talentRequests = await this.chatModel.aggregate([
            {
                $match: { learner: mongoose.Types.ObjectId(learner._id), module: 'source-talent' },
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
                    from: 'source-talents',
                    localField: '_id',
                    foreignField: 'chats',
                    as: 'request',
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
                    from: 'employer-companies',
                    localField: 'employer',
                    foreignField: '_id',
                    as: 'employer',
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
                                from: 'employer-admins',
                                localField: 'employerAdmin',
                                foreignField: '_id',
                                as: 'employerAdmin',
                            },
                        },
                        { $unwind: { path: '$learner', preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: '$employerAdmin', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                message: 1,
                                readByLearner: 1,
                                'employerAdmin.fullname': 1,
                                'employerAdmin.profilePhoto': 1,
                                'employerAdmin.profilePhotoThumbnail': 1,
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
            { $unwind: { path: '$employer', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$recentMessage', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$request', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    'course._id': 1,
                    'course.title': 1,
                    recentMessage: 1,
                    'college.title': 1,
                    'college.collegeLogo': 1,
                    createdAt: 1,
                    'request._id': 1,
                    'request.title': 1,
                    'request.message': 1,
                    'employer._id': 1,
                    'employer.title': 1,
                    'employer.employerLogo': 1,
                    'employer.employerLogoThumbnail': 1,
                },
            },
        ]);
        return ResponseHandler_1.default.success(talentRequests);
    }
    async getSourceTalentDetails(id) {
        const sourceTalent = await this.sourceTalentModel
            .findById(id)
            .populate({
            path: 'course',
            select: {
                title: 1,
                coverPhoto: 1,
                coverPhotoThumbnail: 1,
                date: 1,
            },
            populate: [
                {
                    path: 'collegeId',
                    select: 'title',
                },
                {
                    path: 'instructorIds',
                    select: 'fullname',
                },
            ],
        })
            .populate('employer', 'title')
            .exec();
        return ResponseHandler_1.default.success(sourceTalent);
    }
    async getActiveSourceTalentRepliesCount(employerId, { start, end }) {
        const replies = await this.sourceTalentModel
            .aggregate([
            {
                $match: {
                    employer: mongoose.Types.ObjectId(employerId),
                },
            },
            {
                $lookup: {
                    from: 'chats',
                    let: { chats: '$chats' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ['$_id', '$$chats'],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: 'messages',
                                let: { chatId: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$chat', '$$chatId'],
                                            },
                                        },
                                    },
                                    {
                                        $addFields: {
                                            employerAdmin: {
                                                $ifNull: ['$employerAdmin', 'not-found'],
                                            },
                                        },
                                    },
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$employerAdmin', 'not-found'],
                                            },
                                        },
                                    },
                                ],
                                as: 'messages',
                            },
                        },
                        {
                            $match: {
                                $expr: {
                                    $gt: [{ $size: '$messages' }, 0],
                                },
                            },
                        },
                    ],
                    as: 'chat',
                },
            },
            {
                $unwind: '$chat',
            },
            {
                $group: {
                    _id: null,
                    replies: { $sum: 1 },
                },
            },
        ])
            .exec();
        return ResponseHandler_1.default.success(replies.length > 0 ? replies[0].replies : 0);
    }
    async resendSourceTalentMessages(id, user) {
        const sourceTalent = await this.sourceTalentModel.findById(id).lean();
        const message = {
            chat: '',
            message: sourceTalent.message,
            title: sourceTalent.title,
            employerAdmin: user._id,
            readByLearner: false,
            readByEmployerAdmins: [user._id],
            readByUsers: [],
        };
        await Promise.all(sourceTalent.chats.map(async (chatId) => {
            message.chat = chatId;
            const { data: newMessage } = await this.chatService.addChatReply(message);
            return newMessage;
        }));
        return ResponseHandler_1.default.success(null, 'Messages resend successfully.');
    }
    async createSourceTalent(createSourceTalentDto, user) {
        const course = await this.courseModel
            .findById(createSourceTalentDto.course)
            .populate('instructorIds')
            .populate('collegeId')
            .exec();
        createSourceTalentDto.college = course.collegeId._id;
        let sourceTalent = await this.sourceTalentModel.create(createSourceTalentDto);
        const chat = {
            groupName: createSourceTalentDto.title,
            course: createSourceTalentDto.course,
            college: course.collegeId._id,
            createdBy: user._id,
            createdByType: 'employerAdmin',
            type: null,
            employerAdmins: [user._id],
            employer: user.employerId,
            showToCreator: false,
            module: chatList_dto_1.ChatModuleEnum.SOURCE_TALENT,
            moduleDocumentId: sourceTalent._id,
        };
        const message = {
            chat: '',
            message: createSourceTalentDto.message,
            title: createSourceTalentDto.title,
            employerAdmin: user._id,
            readByLearner: false,
            readByEmployerAdmins: [user._id],
            readByUsers: [],
        };
        chat.users = [];
        chat.learner = null;
        let newChats = [];
        const learnerIds = [];
        const learnerNames = [];
        const adminIds = [];
        const chatIds = [];
        if (createSourceTalentDto.type === createSourceTalent_dto_1.SourceTalentType.LEARNER) {
            const enrollments = await this.enrollmentModel
                .find({
                courseId: createSourceTalentDto.course,
                status: { $in: ['approved', 'processed', 'transferred'] },
            })
                .populate('learnerId')
                .lean();
            newChats = await Promise.all(enrollments.map(async (enrollment) => {
                chat.learner = enrollment.learnerId._id;
                learnerIds.push(enrollment.learnerId._id);
                learnerNames.push(enrollment.learnerId.fullname);
                const { data: newChat } = await this.chatService.addChat(chat);
                message.chat = newChat._id;
                const { data: newMessage } = await this.chatService.addChatReply(message);
                const pusherChat = await this.chatModel
                    .findById(newChat._id)
                    .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
                    .populate('employerAdmins', 'fullname profilePhoto profilePhotoThumbnail')
                    .populate('course', 'title numId coverPhoto coverPhotoThumbnail schedule date venue time timeZone     customSchedule hoursPerWeek')
                    .populate('employer', 'title numId employerLogo employerLogoThumbnail address url createdAt')
                    .populate('college', 'title numId collegeLogo collegeLogoThumbnail')
                    .lean()
                    .exec();
                const pusherMessage = await newMessage
                    .populate('employerAdmin', 'fullname profilePhoto profilePhotoThumbnail')
                    .populate('learner', 'fullname profilePhoto profilePhotoThumbnail')
                    .populate('user', 'fullname profilePhoto profilePhotoThumbnail')
                    .execPopulate();
                pusherChat.recentMessage = pusherMessage.toObject();
                const sourceTalentObj = sourceTalent.toObject();
                sourceTalentObj.chat = pusherChat;
                config_1.pusher.trigger(`notification-${enrollment.learnerId._id}`, 'source-talent-request', sourceTalentObj);
                newChat.recentMessages = [newMessage];
                chatIds.push(newChat._id);
                return newChat;
            }));
            const { data: admins } = await this.usersService.getUnmudlAdminsForEmail();
            const { data: collegeSuperAdmins } = await this.usersService.getCollegeSuperAdmins(course.collegeId._id);
            const employer = await this.employerModel.findById(user.employerId);
            const emailRecipients = [...admins, ...collegeSuperAdmins];
            if (course.instructorIds && course.instructorIds.length > 0) {
                emailRecipients.push(course.instructorIds[0]);
            }
            emailRecipients.forEach(async (admin) => {
                await this.mailerService.sendMail({
                    to: admin.emailAddress,
                    from: admin.collegeId ? process.env.PARTNER_NOTIFICATION_FROM : process.env.ADMIN_NOTIFICATION_FROM,
                    subject: 'Unmudl employer trying to message students in one of your courses',
                    template: 'adminLearnerSourceTalent',
                    context: {
                        unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                        date: moment(new Date()).format('LL'),
                        employer: employer.title,
                        course: course.title,
                        learnersCount: learnerNames.length,
                        title: createSourceTalentDto.title,
                        text: createSourceTalentDto.message,
                    },
                });
            });
        }
        else {
            const adminFind = { $or: [], 'notifications.email': { $ne: false } };
            adminFind.$or.push({ $and: [{ collegeId: course.collegeId._id }, { role: { $in: ['admin', 'superadmin'] } }] });
            if (course.instructorIds && course.instructorIds.length > 0) {
                adminFind.$or.push({ _id: course.instructorIds[0] });
            }
            const admins = await this.userModel.find(adminFind, 'fullname emailAddress').lean();
            admins.map(async (admin) => {
                adminIds.push(admin._id);
                config_1.pusher.trigger(`notification-${admin._id}`, 'source-talent-request', sourceTalent);
            });
            chat.users = adminIds;
            const { data: newChat } = await this.chatService.addChat(chat);
            message.chat = newChat._id;
            const { data: newMessage } = await this.chatService.addChatReply(message);
            newChat.recentMessages = [newMessage];
            chatIds.push(newChat._id);
            newChats = [newChat];
            const { data: unmudlAdmins } = await this.usersService.getUnmudlAdminsForEmail();
            const { data: collegeSuperAdmins } = await this.usersService.getCollegeSuperAdmins(course.collegeId._id);
            const employer = await this.employerModel.findById(user.employerId);
            const emailRecipients = [...unmudlAdmins, ...collegeSuperAdmins];
            if (course.instructorIds && course.instructorIds.length > 0) {
                emailRecipients.push(course.instructorIds[0]);
            }
            emailRecipients.forEach(async (admin) => {
                await this.mailerService.sendMail({
                    to: admin.emailAddress,
                    from: admin.collegeId ? process.env.PARTNER_NOTIFICATION_FROM : process.env.ADMIN_NOTIFICATION_FROM,
                    subject: 'Unmudl employer trying to message an instructor in one of your courses',
                    template: 'adminInstructorSourceTalent',
                    context: {
                        unmudlLogo: process.env.UNMUDL_LOGO_PATH,
                        date: moment(new Date()).format('LL'),
                        employer: employer.title,
                        course: course.title,
                        college: course.collegeId.title,
                        instructor: course.instructorIds && course.instructorIds.length > 0
                            ? course.instructorIds[0].fullname
                            : 'the course instructor, but none are specified',
                        title: createSourceTalentDto.title,
                        text: createSourceTalentDto.message,
                    },
                });
            });
        }
        sourceTalent = await this.sourceTalentModel.findByIdAndUpdate(sourceTalent._id, {
            $set: {
                noOfLearners: learnerIds.length,
                noOfUsers: adminIds.length,
                sentToLearners: learnerIds,
                sentToUsers: adminIds,
                chats: chatIds,
            },
        }, { new: true });
        return ResponseHandler_1.default.success({ sourceTalent, newChats }, 'Message sent successfully.');
    }
    async deleteSourceTalent(id) {
        const deletedSourceTalent = await this.sourceTalentModel
            .findByIdAndUpdate(id, { $set: { deletedAt: new Date() } }, { new: true })
            .exec();
        await Promise.all(deletedSourceTalent.chats.map(async (chatId) => {
            const { data: chat } = await this.chatService.softDeleteChat(chatId);
            return chat;
        }));
        return ResponseHandler_1.default.success(null, 'Source talent and associated chats deleted successfully.');
    }
};
SourceTalentService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('source-talent')),
    __param(1, mongoose_1.InjectModel('courses')),
    __param(2, mongoose_1.InjectModel('enrollments')),
    __param(3, mongoose_1.InjectModel('users')),
    __param(4, mongoose_1.InjectModel('chats')),
    __param(5, mongoose_1.InjectModel('employer-companies')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, chat_service_1.ChatService,
        mailer_1.MailerService,
        users_service_1.UsersService])
], SourceTalentService);
exports.SourceTalentService = SourceTalentService;
//# sourceMappingURL=source-talent.service.js.map