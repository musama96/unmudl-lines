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
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const addChat_dto_1 = require("./dto/addChat.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const addReply_dto_1 = require("./dto/addReply.dto");
const chatList_dto_1 = require("./dto/chatList.dto");
const addMembers_dto_1 = require("./dto/addMembers.dto");
const getMembers_dto_1 = require("./dto/getMembers.dto");
const chatId_dto_1 = require("../common/dto/chatId.dto");
const chat_model_1 = require("./chat.model");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const config_1 = require("../config/config");
const ResponseHandler_1 = require("../common/ResponseHandler");
const fs = require("fs");
const archiveChat_dto_1 = require("./dto/archiveChat.dto");
const s3_1 = require("../s3upload/s3");
const sourceTalentChatList_dto_1 = require("./dto/sourceTalentChatList.dto");
const sharp = require('sharp');
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getMembersForChat(getMembersDto, user) {
        getMembersDto.keyword = getMembersDto.keyword ? getMembersDto.keyword : '';
        getMembersDto.perPage = Number(getMembersDto.perPage) ? getMembersDto.perPage : 7;
        getMembersDto.type = getMembersDto.type ? getMembersDto.type : chat_model_1.ChatType.COLLEGE;
        return await this.chatService.getMembersForChat(getMembersDto, user);
    }
    async addChat(addChatDto, user) {
        switch (user.type) {
            case 'learner':
                addChatDto.learner = user._id;
                addChatDto.users = addChatDto.users ? addChatDto.users : [];
                addChatDto.employerAdmins = addChatDto.employerAdmins ? addChatDto.employerAdmins : [];
                addChatDto.createdByType = 'learner';
                addChatDto.type = chat_model_1.ChatType.LEARNER;
                break;
            case 'user':
                addChatDto.learner = addChatDto.learner ? addChatDto.learner : null;
                addChatDto.users = addChatDto.users ? [...addChatDto.users, user._id] : [user._id];
                addChatDto.employerAdmins = addChatDto.employerAdmins ? addChatDto.employerAdmins : [];
                addChatDto.createdByType = 'user';
                addChatDto.type = user.collegeId ? chat_model_1.ChatType.COLLEGE : addChatDto.type ? addChatDto.type : chat_model_1.ChatType.COLLEGE;
                break;
            case 'employer':
                addChatDto.learner = addChatDto.learner ? addChatDto.learner : null;
                addChatDto.users = addChatDto.users ? addChatDto.users : [];
                addChatDto.employerAdmins = addChatDto.employerAdmins ? [...addChatDto.employerAdmins, user._id] : [user._id];
                addChatDto.createdByType = 'employerAdmin';
                addChatDto.type = chat_model_1.ChatType.EMPLOYER;
                break;
        }
        addChatDto.createdBy = user._id;
        return await this.chatService.addChat(addChatDto);
    }
    async addChatReply(addReplyDto, user, files) {
        const { data: chat } = await this.chatService.getChatById(addReplyDto.chat, true, false);
        if (addReplyDto.showToCreator) {
            await this.chatService.updateShowToCreator(addReplyDto.chat, true);
        }
        if (chat) {
            if (files && files.attachments && files.attachments.length > 0) {
                addReplyDto.attachments = files.attachments.map(attachment => `${config_1.CHAT_FILES_PATH}${attachment.filename}`);
                if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID.length > 0) {
                    files = s3_1.setFilenameAndDestination(config_1.CHAT_FILES_PATH, files);
                    await Promise.all(files.attachments.map(async (attachment) => {
                        attachment.buffer = fs.readFileSync(attachment.path);
                        return null;
                    }));
                    s3_1.moveFilesToS3(config_1.CHAT_FILES_PATH, files);
                }
            }
            switch (user.type) {
                case 'learner':
                    if (user._id.toString() === chat.learner.toString()) {
                        addReplyDto.readByLearner = true;
                        addReplyDto.learner = user._id;
                    }
                    else {
                        return ResponseHandler_1.default.fail('You are not a part of this chat group.');
                    }
                    break;
                case 'user':
                    if (chat.users.map(chatUser => chatUser.toString()).includes(user._id.toString())) {
                        addReplyDto.readByUsers = [user._id];
                        addReplyDto.user = user._id;
                    }
                    else {
                        return ResponseHandler_1.default.fail('You are not a part of this chat group.');
                    }
                    break;
                case 'employer':
                    if (chat.employerAdmins.map(employerAdmin => employerAdmin.toString()).includes(user._id.toString())) {
                        addReplyDto.readByEmployerAdmins = [user._id];
                        addReplyDto.employerAdmin = user._id;
                    }
                    else {
                        return ResponseHandler_1.default.fail('You are not a part of this chat group.');
                    }
                    break;
            }
            return await this.chatService.addChatReply(addReplyDto);
        }
        else {
            return ResponseHandler_1.default.fail('Chat does not exist.');
        }
    }
    async getChatsForAUser(chatListDto, user) {
        var _a;
        chatListDto.keyword = chatListDto.keyword ? chatListDto.keyword : '';
        chatListDto.page = Number(chatListDto.page) ? chatListDto.page : 1;
        chatListDto.perPage = Number(chatListDto.perPage) ? chatListDto.perPage : 10;
        chatListDto.sortOrder = chatListDto.sortOrder === 'asc' ? '1' : '-1';
        chatListDto.sortBy = chatListDto.sortBy ? chatListDto.sortBy : 'createdAt';
        chatListDto.archive = chatListDto.archive ? chatListDto.archive : false;
        chatListDto.module = chatListDto.module ? chatListDto.module : null;
        chatListDto.moduleDocumentIds = ((_a = chatListDto.moduleDocumentIds) === null || _a === void 0 ? void 0 : _a.length) > 0 ? chatListDto.moduleDocumentIds : [];
        return await this.chatService.getChatsForAUser(chatListDto, user);
    }
    async getSourceTalentChatsForAUser(chatListDto, user) {
        chatListDto.keyword = chatListDto.keyword ? chatListDto.keyword : '';
        chatListDto.page = Number(chatListDto.page) ? chatListDto.page : 1;
        chatListDto.perPage = Number(chatListDto.perPage) ? chatListDto.perPage : 10;
        chatListDto.sortOrder = chatListDto.sortOrder === 'asc' ? '1' : '-1';
        chatListDto.sortBy = chatListDto.sortBy ? chatListDto.sortBy : 'createdAt';
        chatListDto.archive = chatListDto.archive ? chatListDto.archive : false;
        return await this.chatService.getSourceTalentChatsForAUser(chatListDto, user);
    }
    async getChatDetails(chatIdDto, user) {
        return await this.chatService.getChatDetails(chatIdDto.id, user);
    }
    async deleteChat(chatIdDto, user) {
        return await this.chatService.deleteChat(chatIdDto.id, user._id);
    }
    async addMembersToChat(addMembersDto, user) {
        return await this.chatService.addMembersToChat(addMembersDto);
    }
    async initializeContactUnmudlChats(user) {
        if (!user.employerId) {
            return ResponseHandler_1.default.fail('Unauthorized', null, 401);
        }
        return await this.chatService.initializeContactUnmudlChats(user);
    }
    async addChatToArchive(archiveChatDto, user) {
        return await this.chatService.addChatToArchive(archiveChatDto, user);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get chats for a user.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    common_1.Get('members'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getMembers_dto_1.GetMembersDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMembersForChat", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add chat.' }),
    common_1.Post(),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addChat_dto_1.AddChatDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addChat", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Reply to a chat.' }),
    common_1.Post('reply'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    swagger_1.ApiConsumes('multipart/form-data'),
    common_1.HttpCode(200),
    common_1.UseInterceptors(platform_express_1.FileFieldsInterceptor([{ name: 'attachments' }], {
        storage: multer_1.diskStorage({
            destination: (req, file, cb) => {
                fs.mkdir('./public' + config_1.CHAT_FILES_PATH, { recursive: true }, err => {
                    if (err) {
                        return ResponseHandler_1.default.fail(err.message);
                    }
                    cb(null, './public' + config_1.CHAT_FILES_PATH);
                });
            },
            filename: (req, file, cb) => {
                let name = file.originalname.split('.');
                cb(null, name[0].replace(/[^a-z\d]+/gi, '-').toLowerCase() + '-' + Date.now() + '.' + name[name.length - 1]);
            },
        }),
    })),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()), __param(2, common_1.UploadedFiles()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addReply_dto_1.AddChatReplyDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addChatReply", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get chats for a user.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    common_1.Get(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chatList_dto_1.ChatListDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatsForAUser", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get chats for a user.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    common_1.Get('source-talents'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sourceTalentChatList_dto_1.SourceTalentChatListDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getSourceTalentChatsForAUser", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Get chat details.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    common_1.Get(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chatId_dto_1.ChatIdDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatDetails", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Delete chat.' }),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    common_1.Delete(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chatId_dto_1.ChatIdDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteChat", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add members to a chat.' }),
    common_1.Post('add-members'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addMembers_dto_1.AddMembersDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addMembersToChat", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Initialize contact unmudl chats for a user.' }),
    common_1.Post('init-contact-unmudl'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "initializeContactUnmudlChats", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiOperation({ summary: 'Add chat to archive.' }),
    common_1.Post('archive'),
    common_1.UseGuards(passport_1.AuthGuard('jwt'), roles_guard_1.RolesGuard),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [archiveChat_dto_1.ArchiveChatDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addChatToArchive", null);
ChatController = __decorate([
    swagger_1.ApiTags('Chat'),
    common_1.Controller('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map