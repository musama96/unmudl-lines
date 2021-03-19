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
const swagger_1 = require("@nestjs/swagger");
const internal_chat_service_1 = require("./internal-chat.service");
const passport_1 = require("@nestjs/passport");
const createChatGroup_dto_1 = require("./dto/createChatGroup.dto");
const get_user_decorator_1 = require("../auth/get-user.decorator");
const sendMessage_dto_1 = require("./dto/sendMessage.dto");
const addMembers_dto_1 = require("./dto/addMembers.dto");
const getMessages_dto_1 = require("./dto/getMessages.dto");
const chatIdDto_1 = require("./dto/chatIdDto");
const messageId_dto_1 = require("./dto/messageId.dto");
let InternalChatController = class InternalChatController {
    constructor(internalChatService) {
        this.internalChatService = internalChatService;
    }
    async CreateNewChatGroup(createChatGroupDto, user) {
        createChatGroupDto.members.push(user._id);
        createChatGroupDto.createdBy = user._id;
        createChatGroupDto.groupPhoto = user.profilePhotoThumbnail ? user.profilePhotoThumbnail : user.profilePhoto;
        return await this.internalChatService.createChatGroup(createChatGroupDto);
    }
    async SendNewMessage(sendMessageDto, user) {
        sendMessageDto.from = user._id;
        return await this.internalChatService.sendMessage(sendMessageDto);
    }
    async AddMembers(addMembersDto, user) {
        return await this.internalChatService.addMembers(addMembersDto);
    }
    async UpdateReadBy(messageIdDto, user) {
        messageIdDto.userId = user._id;
        return await this.internalChatService.updateReadBy(messageIdDto);
    }
    async GetChatGroups(user) {
        return await this.internalChatService.getChatGroups(user._id);
    }
    async GetChatGroupDetail(chatIdDto, user) {
        chatIdDto.userId = user._id;
        return await this.internalChatService.getChatGroupDetail(chatIdDto);
    }
    async GetMessages(getMessagesDto, user) {
        getMessagesDto.page = getMessagesDto.page ? Number(getMessagesDto.page) : 1;
        getMessagesDto.perPage = getMessagesDto.perPage ? Number(getMessagesDto.perPage) : 8;
        getMessagesDto.userId = user._id;
        return await this.internalChatService.getMessages(getMessagesDto);
    }
};
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'create a new chat group.' }),
    common_1.Post('chatGroup'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createChatGroup_dto_1.CreateChatGroupDto, Object]),
    __metadata("design:returntype", Promise)
], InternalChatController.prototype, "CreateNewChatGroup", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'send a new message in a chat group.' }),
    common_1.Post('message'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sendMessage_dto_1.SendMessageDto, Object]),
    __metadata("design:returntype", Promise)
], InternalChatController.prototype, "SendNewMessage", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'send a new message in a chat group.' }),
    common_1.Post('add-members'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [addMembers_dto_1.AddMembersDto, Object]),
    __metadata("design:returntype", Promise)
], InternalChatController.prototype, "AddMembers", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'send a new message in a chat group.' }),
    common_1.Post('update-readBy'),
    common_1.HttpCode(200),
    swagger_1.ApiConsumes('application/x-www-form-urlencoded'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [messageId_dto_1.MessageIdDto, Object]),
    __metadata("design:returntype", Promise)
], InternalChatController.prototype, "UpdateReadBy", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'send a new message in a chat group.' }),
    common_1.Get('chatGroups'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InternalChatController.prototype, "GetChatGroups", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'send a new message in a chat group.' }),
    common_1.Get('chatGroup/detail/:chatId'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Param()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chatIdDto_1.ChatIdDto, Object]),
    __metadata("design:returntype", Promise)
], InternalChatController.prototype, "GetChatGroupDetail", null);
__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    swagger_1.ApiOperation({ summary: 'send a new message in a chat group.' }),
    common_1.Get('messages'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Query()), __param(1, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [getMessages_dto_1.GetMessagesDto, Object]),
    __metadata("design:returntype", Promise)
], InternalChatController.prototype, "GetMessages", null);
InternalChatController = __decorate([
    swagger_1.ApiTags('Internal chat'),
    common_1.Controller('internal-chat'),
    __metadata("design:paramtypes", [internal_chat_service_1.InternalChatService])
], InternalChatController);
exports.InternalChatController = InternalChatController;
//# sourceMappingURL=internal-chat.controller.js.map